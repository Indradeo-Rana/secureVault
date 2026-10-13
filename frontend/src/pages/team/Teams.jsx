import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { ToastContainer,toast } from "react-toastify";
import { Eye, Trash2, Users } from "lucide-react";
import API_BASE_URL from "../../config/api";

function Teams() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/teams/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "Failed to load teams");
      }

      const data = text ? JSON.parse(text) : [];

      setTeams(data);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load teams");
      // alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      // alert("Team name is required");
      toast.error("Team name is required");
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: teamName.trim(),
        }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "Failed to create team");
      }

      const data = text ? JSON.parse(text) : null;

      if (!data) {
        throw new Error("Backend returned an empty response");
      }

      setTeams((previous) => [...previous, data]);

      setTeamName("");

      // alert("Team created successfully");
      toast.success("Team created successfully");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {

    const confirmed = window.confirm(
        "Are you sure you want to delete this team? All team members and team credentials will be removed."
    );

    if (!confirmed) {
        return;
    }

    try {

        const token =
            localStorage.getItem("token");

        const response = await fetch(
            `${API_BASE_URL}/api/teams/${teamId}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const text =
            await response.text();

        if (!response.ok) {

            throw new Error(
                text ||
                "Failed to delete team"
            );
        }

        // Remove deleted team from UI
        setTeams(
            previous =>
                previous.filter(
                    team =>
                        team.id !== teamId
                )
        );

        // alert("Team deleted successfully");
        toast.success("Team deleted successfully");

    } catch (error) {

        console.error(error);

        // alert(error.message);
        toast.error(
            error.message ||
            "Failed to delete team"
        );
    }
};

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Team Vault</h1>

          <p className="text-slate-500 mt-1">Create and manage your teams.</p>
        </div>

        <button
          onClick={() => {
            const element = document.getElementById("create-team");

            element?.scrollIntoView({
              behavior: "smooth",
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          + Create Team
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading teams...</div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Existing Teams
            </h2>

            {teams.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
                <Users className="mx-auto mb-4 text-slate-400" size={48} aria-hidden="true" />

                <h3 className="text-lg font-bold">No teams yet</h3>

                <p className="text-slate-500 mt-2">Create your first team.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <Users size={24} aria-hidden="true" />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          {team.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                          Owner: {team.ownerUsername}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/teams/${team.id}`)}
                        className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
                      >
                        <Eye size={16} aria-hidden="true" />
                        Open Team
                      </button>

                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            id="create-team"
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Create New Team
            </h2>

            <form
              onSubmit={createTeam}
              className="flex flex-col md:flex-row gap-3"
            >
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </form>
          </div>
          <ToastContainer />
        </>
      )}
    </Layout>
  );
}

export default Teams;
