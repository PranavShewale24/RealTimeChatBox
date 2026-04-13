import { useEffect, useMemo, useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import avatar from "../assets/avatar.png";
import { Search, UserRound, UserRoundPlus } from "lucide-react";

const ExplorePage = () => {
  const {
    suggestions,
    incomingRequests,
    outgoingRequests,
    isSuggestionsLoading,
    isRequestsLoading,
    getSuggestions,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    selectedExploreUser,
    setSelectedExploreUser,
  } = useFriendStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuggestions = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return suggestions;

    return suggestions.filter((user) => {
      const name = user.fullName?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      return name.includes(normalizedTerm) || email.includes(normalizedTerm);
    });
  }, [searchTerm, suggestions]);

  useEffect(() => {
    getSuggestions();
    getFriendRequests();
  }, [getSuggestions, getFriendRequests]);

  return (
    <div className="min-h-screen bg-base-200 pt-20 px-4">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 bg-base-100 rounded-xl p-5 border border-base-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Explore People</h2>
            <span className="text-sm text-base-content/60">Suggested friends</span>
          </div>

          <label className="input input-bordered flex items-center gap-2 mb-4">
            <Search className="size-4 text-base-content/50" />
            <input
              type="text"
              className="grow"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          {isSuggestionsLoading ? (
            <p className="text-base-content/60">Loading suggestions...</p>
          ) : suggestions.length === 0 ? (
            <p className="text-base-content/60">No suggestions available right now.</p>
          ) : filteredSuggestions.length === 0 ? (
            <p className="text-base-content/60">No users match your search.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredSuggestions.map((user) => (
                <div key={user._id} className="border border-base-300 rounded-lg p-4 bg-base-100">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="size-14 rounded-full">
                        <img src={user.profilePic || avatar} alt={user.fullName} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{user.fullName}</h3>
                      <p className="text-sm text-base-content/60 truncate">{user.email}</p>
                      <p className="text-xs mt-1 text-base-content/60">
                        {user.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="btn btn-sm btn-primary flex-1"
                      onClick={() => sendFriendRequest(user._id)}
                    >
                      <UserRoundPlus className="size-4" />
                      Send Request
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setSelectedExploreUser(user)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="bg-base-100 rounded-xl p-5 border border-base-300">
            <h2 className="text-lg font-semibold mb-3">Incoming Requests</h2>
            {isRequestsLoading ? (
              <p className="text-base-content/60">Loading...</p>
            ) : incomingRequests.length === 0 ? (
              <p className="text-sm text-base-content/60">No incoming requests</p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((user) => (
                  <div key={user._id} className="border border-base-300 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={user.profilePic || avatar}
                          alt={user.fullName}
                          className="size-10 rounded-full"
                        />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.fullName}</p>
                          <p className="text-xs text-base-content/60 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="btn btn-sm btn-success flex-1"
                        onClick={() => acceptFriendRequest(user._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-sm btn-outline flex-1"
                        onClick={() => rejectFriendRequest(user._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-base-100 rounded-xl p-5 border border-base-300">
            <h2 className="text-lg font-semibold mb-3">Sent Requests</h2>
            {isRequestsLoading ? (
              <p className="text-base-content/60">Loading...</p>
            ) : outgoingRequests.length === 0 ? (
              <p className="text-sm text-base-content/60">No pending sent requests</p>
            ) : (
              <div className="space-y-2">
                {outgoingRequests.map((user) => (
                  <div key={user._id} className="flex items-center gap-2 text-sm">
                    <img src={user.profilePic || avatar} alt={user.fullName} className="size-8 rounded-full" />
                    <span className="truncate">{user.fullName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedExploreUser && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <UserRound className="size-5" />
              Profile Preview
            </h3>
            <div className="flex flex-col items-center gap-3">
              <img
                src={selectedExploreUser.profilePic || avatar}
                alt={selectedExploreUser.fullName}
                className="size-20 rounded-full object-cover"
              />
              <p className="font-semibold text-lg">{selectedExploreUser.fullName}</p>
              <p className="text-sm text-base-content/70">{selectedExploreUser.email}</p>
              <p className="text-xs text-base-content/60">
                {selectedExploreUser.isOnline ? "Online" : "Offline"}
              </p>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedExploreUser(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ExplorePage;
