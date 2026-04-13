import User from "../models/user.model.js";
import { isUserOnline } from "../lib/socket.js";

const mapUser = (user, includeStatus = false) => {
  const mapped = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
  };

  if (includeStatus) {
    mapped.isOnline = isUserOnline(String(user._id));
  }

  return mapped;
};

export const sendFriendRequest = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const { userId: receiverId } = req.params;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver user id is required" });
    }

    if (String(requesterId) === String(receiverId)) {
      return res.status(400).json({ message: "You cannot send request to yourself" });
    }

    const [requester, receiver] = await Promise.all([
      User.findById(requesterId),
      User.findById(receiverId),
    ]);

    if (!requester || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFriends = requester.friends.some((id) => String(id) === String(receiverId));
    if (alreadyFriends) {
      return res.status(400).json({ message: "You are already friends" });
    }

    const alreadyRequested = requester.outgoingFriendRequests.some(
      (id) => String(id) === String(receiverId)
    );
    if (alreadyRequested) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    const hasIncomingFromReceiver = requester.incomingFriendRequests.some(
      (id) => String(id) === String(receiverId)
    );
    if (hasIncomingFromReceiver) {
      return res.status(400).json({
        message: "This user already sent you a request. Accept it from pending requests.",
      });
    }

    await Promise.all([
      User.findByIdAndUpdate(requesterId, {
        $addToSet: { outgoingFriendRequests: receiverId },
      }),
      User.findByIdAndUpdate(receiverId, {
        $addToSet: { incomingFriendRequests: requesterId },
      }),
    ]);

    return res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.log("Error in sendFriendRequest controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const { userId: requesterId } = req.params;

    const [receiver, requester] = await Promise.all([
      User.findById(receiverId),
      User.findById(requesterId),
    ]);

    if (!receiver || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasIncomingRequest = receiver.incomingFriendRequests.some(
      (id) => String(id) === String(requesterId)
    );

    if (!hasIncomingRequest) {
      return res.status(400).json({ message: "No pending friend request from this user" });
    }

    await Promise.all([
      User.findByIdAndUpdate(receiverId, {
        $pull: { incomingFriendRequests: requesterId },
        $addToSet: { friends: requesterId },
      }),
      User.findByIdAndUpdate(requesterId, {
        $pull: { outgoingFriendRequests: receiverId },
        $addToSet: { friends: receiverId },
      }),
    ]);

    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const { userId: requesterId } = req.params;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasIncomingRequest = receiver.incomingFriendRequests.some(
      (id) => String(id) === String(requesterId)
    );

    if (!hasIncomingRequest) {
      return res.status(400).json({ message: "No pending friend request from this user" });
    }

    await Promise.all([
      User.findByIdAndUpdate(receiverId, {
        $pull: { incomingFriendRequests: requesterId },
      }),
      User.findByIdAndUpdate(requesterId, {
        $pull: { outgoingFriendRequests: receiverId },
      }),
    ]);

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.log("Error in rejectFriendRequest controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("incomingFriendRequests", "fullName email profilePic")
      .populate("outgoingFriendRequests", "fullName email profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const incoming = user.incomingFriendRequests.map((requestUser) => mapUser(requestUser, true));
    const outgoing = user.outgoingFriendRequests.map((requestUser) => mapUser(requestUser, true));

    return res.status(200).json({ incoming, outgoing });
  } catch (error) {
    console.log("Error in getFriendRequests controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", "fullName email profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = user.friends.map((friend) => mapUser(friend, true));

    return res.status(200).json({ friends });
  } catch (error) {
    console.log("Error in getFriends controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const excludedUserIds = [
      user._id,
      ...user.friends,
      ...user.incomingFriendRequests,
      ...user.outgoingFriendRequests,
    ];

    const suggestions = await User.find({
      _id: { $nin: excludedUserIds },
    }).select("fullName email profilePic");

    const mappedSuggestions = suggestions.map((suggestedUser) => mapUser(suggestedUser, true));

    return res.status(200).json({ suggestions: mappedSuggestions });
  } catch (error) {
    console.log("Error in getSuggestedUsers controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
