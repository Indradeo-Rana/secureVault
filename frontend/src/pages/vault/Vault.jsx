import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import ShareCredential from "../../components/ShareCredential";
import API_BASE_URL from "../../config/api";
import { ToastContainer, toast } from "react-toastify";
import { FileText, KeyRound, Search, Star } from "lucide-react";

function Vault() {
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [sharingCredential, setSharingCredential] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedType, setSelectedType] = useState("All");
    const [favoriteOnly, setFavoriteOnly] = useState(false);
    const [visiblePasswordId, setVisiblePasswordId] = useState(null);

    /*
     * =========================================================
     * FETCH CREDENTIALS
     * =========================================================
     */
    const fetchCredentials = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/credential`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch credentials");
            }

            const data = await response.json();

            setCredentials(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Fetch credentials error:", error);
            toast.error("Failed to load credentials.");
            setCredentials([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, []);

    /*
     * =========================================================
     * DELETE CREDENTIAL
     * =========================================================
     */
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this credential?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/credential/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete credential");
            }

            setCredentials((prev) =>
                prev.filter((credential) => credential.id !== id)
            );

            toast.success("Credential deleted successfully.");
        } catch (error) {
            console.error("Delete credential error:", error);
            toast.error("Failed to delete credential.");
        }
    };

    /*
     * =========================================================
     * CATEGORY
     *
     * First priority:
     * backend category
     *
     * Fallback:
     * old automatic category logic
     * =========================================================
     */
    const getCategory = (credential) => {
        if (
            credential.category &&
            credential.category.trim() !== ""
        ) {
            return credential.category;
        }

        const title = credential.title?.toLowerCase() || "";
        const website = credential.website?.toLowerCase() || "";

        if (
            title.includes("bank") ||
            title.includes("netbanking") ||
            title.includes("banking")
        ) {
            return "Banking";
        }

        if (
            title.includes("github") ||
            title.includes("aws") ||
            title.includes("api") ||
            title.includes("server") ||
            title.includes("ssh")
        ) {
            return "API Keys";
        }

        if (
            website.includes("facebook") ||
            website.includes("instagram") ||
            website.includes("twitter") ||
            website.includes("linkedin")
        ) {
            return "Social";
        }

        if (
            website.includes("gmail") ||
            website.includes("outlook") ||
            website.includes("yahoo")
        ) {
            return "Email";
        }

        if (website) {
            return "Website";
        }

        if (credential.notes) {
            return "Secure Notes";
        }

        return "Other";
    };

    /*
     * =========================================================
     * CREDENTIAL TYPE
     * =========================================================
     */
    const getCredentialType = (credential) => {
        if (
            credential.credentialType &&
            credential.credentialType.trim() !== ""
        ) {
            return credential.credentialType;
        }

        const category = getCategory(credential);

        if (category === "Secure Notes") {
            return "SECURE_NOTE";
        }

        return "LOGIN";
    };

    /*
     * =========================================================
     * FAVORITE
     * =========================================================
     */
    const isFavorite = (credential) => {
        return credential.favorite === true;
    };

    /*
     * =========================================================
     * TOGGLE FAVORITE
     * =========================================================
     */
    const handleToggleFavorite = async (credential) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
               `${API_BASE_URL}/api/credential/${credential.id}/favorite`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update favorite");
            }

            /*
             * Backend may return updated credential.
             * If it does, use it.
             *
             * Otherwise simply toggle the local value.
             */
            let updatedCredential = null;

            try {
                updatedCredential = await response.json();
            } catch {
                updatedCredential = null;
            }

            setCredentials((prev) =>
                prev.map((item) => {
                    if (item.id !== credential.id) {
                        return item;
                    }

                    if (
                        updatedCredential &&
                        typeof updatedCredential === "object"
                    ) {
                        return updatedCredential;
                    }

                    return {
                        ...item,
                        favorite: !item.favorite,
                    };
                })
            );

            toast.success(
                credential.favorite
                    ? "Removed from favorites."
                    : "Added to favorites."
            );
        } catch (error) {
            console.error("Favorite error:", error);
            toast.error("Failed to update favorite.");
        }
    };

    /*
     * =========================================================
     * PASSWORD STRENGTH
     * =========================================================
     */
    const getStrength = (password) => {
        if (!password) {
            return {
                label: "N/A",
                className: "bg-slate-100 text-slate-500",
            };
        }

        let score = 0;

        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score >= 5) {
            return {
                label: "Strong",
                className: "bg-emerald-100 text-emerald-700",
            };
        }

        if (score >= 3) {
            return {
                label: "Medium",
                className: "bg-amber-100 text-amber-700",
            };
        }

        return {
            label: "Weak",
            className: "bg-red-100 text-red-700",
        };
    };

    /*
     * =========================================================
     * DATE
     * =========================================================
     */
    const formatUpdatedDate = (credential) => {
        const date =
            credential.updatedAt ||
            credential.createdAt ||
            credential.lastUpdated;

        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString();
    };

    /*
     * =========================================================
     * CATEGORY LIST
     * =========================================================
     */
    const categories = useMemo(() => {
        const categorySet = new Set();

        credentials.forEach((credential) => {
            categorySet.add(getCategory(credential));
        });

        return ["All", ...Array.from(categorySet).sort()];
    }, [credentials]);

    /*
     * =========================================================
     * CREDENTIAL TYPE LIST
     * =========================================================
     */
    const credentialTypes = useMemo(() => {
        const typeSet = new Set();

        credentials.forEach((credential) => {
            typeSet.add(getCredentialType(credential));
        });

        return ["All", ...Array.from(typeSet).sort()];
    }, [credentials]);

    /*
     * =========================================================
     * FILTER CREDENTIALS
     * =========================================================
     */
    const filteredCredentials = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return credentials.filter((credential) => {
            const title =
                credential.title?.toLowerCase() || "";

            const username =
                credential.username?.toLowerCase() || "";

            const website =
                credential.website?.toLowerCase() || "";

            const category =
                getCategory(credential).toLowerCase();

            const type =
                getCredentialType(credential).toLowerCase();

            const matchesSearch =
                !searchText ||
                title.includes(searchText) ||
                username.includes(searchText) ||
                website.includes(searchText) ||
                category.includes(searchText) ||
                type.includes(searchText);

            const matchesCategory =
                selectedCategory === "All" ||
                getCategory(credential) === selectedCategory;

            const matchesType =
                selectedType === "All" ||
                getCredentialType(credential) === selectedType;

            const matchesFavorite =
                !favoriteOnly ||
                isFavorite(credential);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesType &&
                matchesFavorite
            );
        });
    }, [
        credentials,
        search,
        selectedCategory,
        selectedType,
        favoriteOnly,
    ]);

    /*
     * =========================================================
     * SHOW / HIDE PASSWORD
     * =========================================================
     */
    const handleShowPassword = (credentialId) => {
        setVisiblePasswordId((prev) =>
            prev === credentialId ? null : credentialId
        );
    };

    /*
     * =========================================================
     * RESET FILTERS
     * =========================================================
     */
    const resetFilters = () => {
        setSearch("");
        setSelectedCategory("All");
        setSelectedType("All");
        setFavoriteOnly(false);
    };

    return (
        <Layout>
            <div className="space-y-6">

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Password Vault
                        </h1>

                        <p className="text-slate-500 mt-1">
                            All stored credentials, organized and searchable.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/add-credential")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-medium transition"
                    >
                        + Add Credential
                    </button>

                </div>

                {/* =====================================================
                    SEARCH
                ====================================================== */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

                    <div className="relative">

                        <span className="absolute left-4 top-3 text-slate-400">
                            <Search size={18} aria-hidden="true" />
                        </span>

                        <input
                            type="text"
                            placeholder="Search credentials..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-lg pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                        />

                    </div>

                </div>

                {/* =====================================================
                    FILTERS
                ====================================================== */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

                    <div className="flex flex-col lg:flex-row gap-4">

                        {/* Category */}
                        <div className="flex-1">

                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                                Category
                            </label>

                            <select
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {categories.map((category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </option>
                                ))}
                            </select>

                        </div>

                        {/* Credential Type */}
                        <div className="flex-1">

                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                                Credential Type
                            </label>

                            <select
                                value={selectedType}
                                onChange={(e) =>
                                    setSelectedType(e.target.value)
                                }
                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {credentialTypes.map((type) => (
                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>
                                ))}
                            </select>

                        </div>

                        {/* Favorite */}
                        <div className="flex items-end">

                            <button
                                type="button"
                                onClick={() =>
                                    setFavoriteOnly((prev) => !prev)
                                }
                                className={`px-4 py-2.5 rounded-lg border font-medium transition ${
                                    favoriteOnly
                                        ? "bg-amber-50 text-amber-700 border-amber-300"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <Star size={16} fill={favoriteOnly ? "currentColor" : "none"} aria-hidden="true" />
                                Favorites
                            </button>

                        </div>

                        {/* Reset */}
                        <div className="flex items-end">

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                            >
                                Reset
                            </button>

                        </div>

                    </div>

                </div>

                {/* =====================================================
                    CATEGORY QUICK TABS
                ====================================================== */}
                <div className="flex gap-2 overflow-x-auto pb-1">

                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() =>
                                setSelectedCategory(category)
                            }
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm border transition ${
                                selectedCategory === category
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {category}

                            {category === "All" &&
                                ` (${credentials.length})`}
                        </button>
                    ))}

                </div>

                {/* =====================================================
                    RESULT COUNT
                ====================================================== */}
                {!loading && (
                    <div className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                            {filteredCredentials.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                            {credentials.length}
                        </span>{" "}
                        credentials
                    </div>
                )}

                {/* =====================================================
                    LOADING
                ====================================================== */}
                {loading && (
                    <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">

                        <div className="text-slate-500">
                            Loading credentials...
                        </div>

                    </div>
                )}

                {/* =====================================================
                    EMPTY
                ====================================================== */}
                {!loading &&
                    filteredCredentials.length === 0 && (
                        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-16 text-center">

                            <KeyRound className="mx-auto mb-4 text-slate-400" size={48} aria-hidden="true" />

                            <h2 className="text-xl font-bold text-slate-800">
                                No credentials found
                            </h2>

                            <p className="text-slate-500 mt-2">
                                {search ||
                                selectedCategory !== "All" ||
                                selectedType !== "All" ||
                                favoriteOnly
                                    ? "Try changing your search or filters."
                                    : "Add your first credential to your vault."}
                            </p>

                            {search ||
                            selectedCategory !== "All" ||
                            selectedType !== "All" ||
                            favoriteOnly ? (
                                <button
                                    onClick={resetFilters}
                                    className="mt-5 border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50"
                                >
                                    Reset Filters
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        navigate("/add-credential")
                                    }
                                    className="mt-5 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700"
                                >
                                    Add Credential
                                </button>
                            )}

                        </div>
                    )}

                {/* =====================================================
                    TABLE
                ====================================================== */}
                {!loading &&
                    filteredCredentials.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1100px]">

                                    <thead>

                                        <tr className="border-b border-slate-200 bg-slate-50">

                                            <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Favorite
                                            </th>

                                            <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Name
                                            </th>

                                            <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Category
                                            </th>

                                            <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Type
                                            </th>

                                            <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Username
                                            </th>

                                            <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Password
                                            </th>

                                            <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Strength
                                            </th>

                                            <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Last Updated
                                            </th>

                                            <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredCredentials.map(
                                            (credential) => {

                                                const strength =
                                                    getStrength(
                                                        credential.password
                                                    );

                                                const category =
                                                    getCategory(
                                                        credential
                                                    );

                                                const type =
                                                    getCredentialType(
                                                        credential
                                                    );

                                                const isPasswordVisible =
                                                    visiblePasswordId ===
                                                    credential.id;

                                                const favorite =
                                                    isFavorite(
                                                        credential
                                                    );

                                                const isSecureNote =
                                                    type ===
                                                        "SECURE_NOTE" ||
                                                    category ===
                                                        "Secure Notes";

                                                return (
                                                    <React.Fragment
                                                        key={
                                                            credential.id
                                                        }
                                                    >

                                                        <tr className="border-b border-slate-100 hover:bg-slate-50 transition">

                                                            {/* Favorite */}
                                                            <td className="px-5 py-4">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleToggleFavorite(
                                                                            credential
                                                                        )
                                                                    }
                                                                    title={
                                                                        favorite
                                                                            ? "Remove from favorites"
                                                                            : "Add to favorites"
                                                                    }
                                                                    className={`text-xl transition ${
                                                                        favorite
                                                                            ? "text-amber-500 hover:text-amber-600"
                                                                            : "text-slate-300 hover:text-amber-400"
                                                                    }`}
                                                                >
                                                                    <Star size={18} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
                                                                </button>

                                                            </td>

                                                            {/* Name */}
                                                            <td className="px-5 py-4">

                                                                <div className="flex items-center gap-3">

                                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                                                        {isSecureNote
                                                                            ? <FileText size={18} aria-hidden="true" />
                                                                            : <KeyRound size={18} aria-hidden="true" />}
                                                                    </div>

                                                                    <div>

                                                                        <p className="font-medium text-slate-800">
                                                                            {
                                                                                credential.title
                                                                            }
                                                                        </p>

                                                                        {credential.website && (
                                                                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
                                                                                {
                                                                                    credential.website
                                                                                }
                                                                            </p>
                                                                        )}

                                                                    </div>

                                                                </div>

                                                            </td>

                                                            {/* Category */}
                                                            <td className="px-5 py-4">

                                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                                    {
                                                                        category
                                                                    }
                                                                </span>

                                                            </td>

                                                            {/* Type */}
                                                            <td className="px-5 py-4">

                                                                <span className="text-sm text-slate-600">
                                                                    {type}
                                                                </span>

                                                            </td>

                                                            {/* Username */}
                                                            <td className="px-5 py-4">

                                                                <span className="text-sm text-slate-700">
                                                                    {isSecureNote
                                                                        ? "—"
                                                                        : credential.username ||
                                                                          "—"}
                                                                </span>

                                                            </td>

                                                            {/* Password */}
                                                            <td className="px-5 py-4">

                                                                {isSecureNote ? (
                                                                    <span className="text-sm text-slate-400">
                                                                        Secure Note
                                                                    </span>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">

                                                                        <span className="font-mono text-sm text-slate-600 max-w-[150px] truncate">
                                                                            {isPasswordVisible
                                                                                ? credential.password
                                                                                : "••••••••"}
                                                                        </span>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleShowPassword(
                                                                                    credential.id
                                                                                )
                                                                            }
                                                                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                                                        >
                                                                            {isPasswordVisible
                                                                                ? "Hide"
                                                                                : "Show"}
                                                                        </button>

                                                                    </div>
                                                                )}

                                                            </td>

                                                            {/* Strength */}
                                                            <td className="px-5 py-4">

                                                                {isSecureNote ? (
                                                                    <span className="text-sm text-slate-400">
                                                                        N/A
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${strength.className}`}
                                                                    >
                                                                        {
                                                                            strength.label
                                                                        }
                                                                    </span>
                                                                )}

                                                            </td>

                                                            {/* Updated */}
                                                            <td className="px-5 py-4">

                                                                <span className="text-sm text-slate-500">
                                                                    {formatUpdatedDate(
                                                                        credential
                                                                    )}
                                                                </span>

                                                            </td>

                                                            {/* Actions */}
                                                            <td className="px-5 py-4">

                                                                <div className="flex justify-end items-center gap-2">

                                                                    {/* View */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/credential/${credential.id}`,
                                                                                {
                                                                                    state: {
                                                                                        from: "/vault",
                                                                                    },
                                                                                }
                                                                            )
                                                                        }
                                                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                                    >
                                                                        View
                                                                    </button>

                                                                    {/* Edit */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/edit-credential/${credential.id}`
                                                                            )
                                                                        }
                                                                        className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    {/* Share */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setSharingCredential(
                                                                                credential
                                                                            )
                                                                        }
                                                                        className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                                                                    >
                                                                        Share
                                                                    </button>

                                                                    {/* Delete */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                credential.id
                                                                            )
                                                                        }
                                                                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        </tr>

                                                        {/* Share section */}
                                                        {sharingCredential?.id ===
                                                            credential.id && (
                                                            <tr>

                                                                <td
                                                                    colSpan="9"
                                                                    className="px-5 py-4 bg-slate-50"
                                                                >

                                                                    <ShareCredential
                                                                        credentialId={
                                                                            credential.id
                                                                        }
                                                                        onClose={() =>
                                                                            setSharingCredential(
                                                                                null
                                                                            )
                                                                        }
                                                                    />

                                                                </td>

                                                            </tr>
                                                        )}

                                                    </React.Fragment>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    )}

            </div>

            <ToastContainer position="top-right" />

        </Layout>
    );
}

export default Vault;
