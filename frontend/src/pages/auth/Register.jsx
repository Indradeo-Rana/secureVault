import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import API_BASE_URL from "../../config/api";

function Register() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(errorText);

                throw new Error(
                    "Registration failed! Please check your credential."
                );
            }

            // alert(
            //     "Registration successful. Please login."
            // );
            toast.success(
                "Registration successful. Please login."
            );

            navigate("/login");

        } catch (error) {

            console.error(error);

            // alert(
            //     "Registration failed. Please try again."
            // );
            toast.error(
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_10%_15%,rgba(85,139,255,0.24),transparent_30%),radial-gradient(circle_at_90%_85%,rgba(255,178,106,0.2),transparent_28%),#0f172a] p-4 text-slate-900 sm:p-8">
            <div className="grid w-full max-w-[900px] overflow-hidden rounded-[20px] border border-white/10 bg-white shadow-[0_24px_60px_rgba(3,8,20,0.3)] md:grid-cols-2 max-[760px]:block max-[420px]:min-h-screen max-[420px]:rounded-none max-[420px]:border-0">
                <aside className="relative flex min-h-[520px] flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,rgba(27,69,155,0.98),rgba(20,39,93,0.98))] p-9 text-white after:absolute after:-right-[90px] after:-bottom-[110px] after:h-[280px] after:w-[280px] after:rounded-full after:border after:border-white/15 after:shadow-[0_0_0_28px_rgba(255,255,255,0.05),0_0_0_58px_rgba(255,255,255,0.035)] max-[760px]:min-h-0 max-[760px]:p-[28px_24px_30px]">
                    <div className="relative z-10 inline-flex w-fit items-center gap-3 text-[1.1rem] font-bold tracking-[0.01em]">
                        <span className="grid h-[42px] w-[42px] place-items-center rounded-[13px] border border-white/25 bg-white/10"><LockKeyhole size={21} /></span>
                        SecureVault
                    </div>
                    <div className="relative z-10 max-w-[340px] max-[760px]:mt-[52px]">
                        <div className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#a9c6ff]">A stronger start</div>
                        <h1 className="m-0 text-[clamp(2.1rem,4vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.045em] max-[760px]:text-[2.2rem]">One secure home for every login.</h1>
                        <p className="mt-5 text-base leading-[1.7] text-[#cfddff] max-[760px]:mt-3 max-[760px]:text-[0.92rem]">Create your private vault and bring a little more calm to your digital life.</p>
                    </div>
                    <div className="relative z-10 mt-[30px] flex items-center gap-2.5 text-[0.86rem] text-[#dce7ff]"><ShieldCheck size={18} /> Your credentials stay yours</div>
                </aside>

                <main className="flex items-center bg-white px-10 py-10 max-[760px]:px-6 max-[760px]:py-[34px] max-[420px]:px-5 max-[420px]:py-[30px]">
                    <div className="mx-auto w-full max-w-[360px]">
                        <div>
                            <h2 className="m-0 text-[clamp(1.8rem,3vw,2.25rem)] font-bold tracking-[-0.035em] text-[#172033]">Create your account</h2>
                            <p className="mb-8 mt-2.5 leading-[1.6] text-[#6f7b90]">Start securing your credentials in a few seconds.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="mb-2 block text-[0.84rem] font-bold text-[#344056]" htmlFor="register-username">Username</label>
                                <div className="relative">
                                    <UserRound className="pointer-events-none absolute left-[15px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8a96a9]" aria-hidden="true" />
                                    <input
                                        id="register-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        className="min-h-[52px] w-full rounded-[11px] border border-[#d9e0ea] bg-[#fbfcfe] px-4 pl-11 text-[#172033] outline-none transition focus:border-[#2864e6] focus:bg-white focus:ring-4 focus:ring-[#2864e6]/[0.12]"
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="mb-2 block text-[0.84rem] font-bold text-[#344056]" htmlFor="register-email">Email</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-[15px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8a96a9]" aria-hidden="true" />
                                    <input
                                        id="register-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="min-h-[52px] w-full rounded-[11px] border border-[#d9e0ea] bg-[#fbfcfe] px-4 pl-11 text-[#172033] outline-none transition focus:border-[#2864e6] focus:bg-white focus:ring-4 focus:ring-[#2864e6]/[0.12]"
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="mb-2 block text-[0.84rem] font-bold text-[#344056]" htmlFor="register-password">Password</label>
                                <div className="relative">
                                    <KeyRound className="pointer-events-none absolute left-[15px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8a96a9]" aria-hidden="true" />
                                    <input
                                        id="register-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password"
                                        className="min-h-[52px] w-full rounded-[11px] border border-[#d9e0ea] bg-[#fbfcfe] px-[52px] pl-11 text-[#172033] outline-none transition focus:border-[#2864e6] focus:bg-white focus:ring-4 focus:ring-[#2864e6]/[0.12]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-[7px] top-1/2 grid h-[38px] w-[38px] -translate-y-1/2 place-items-center rounded-lg border-0 bg-transparent text-[#647188] transition hover:bg-[#eef4ff] hover:text-[#2864e6] focus-visible:bg-[#eef4ff] focus-visible:text-[#2864e6] focus-visible:outline-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[11px] border-0 bg-[#2864e6] font-bold text-white shadow-[0_10px_20px_rgba(40,100,230,0.2)] transition hover:-translate-y-px hover:bg-[#1e4fc0] hover:shadow-[0_12px_24px_rgba(40,100,230,0.28)] disabled:cursor-wait disabled:opacity-70">
                                {loading ? "Creating..." : "Create account"}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-[0.88rem] text-[#6f7b90]">
                            Already have an account?{" "}
                            <button className="cursor-pointer border-0 bg-transparent p-0 font-bold text-[#2864e6] hover:text-[#1e4fc0] hover:underline" onClick={() => navigate("/login")}>Log in</button>
                        </p>
                    </div>
                </main>
            </div>

            <ToastContainer />
        </div>
    );
}

export default Register;