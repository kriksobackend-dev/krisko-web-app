import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type OtpForm = { otp: string };

export function OtpVerificationPage() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<OtpForm>();

  const onSubmit = async () => {
    navigate("/app");
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="mb-3 text-xl font-semibold">OTP Verification</h1>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <input className="w-full rounded border p-3" placeholder="Enter 6-digit OTP" {...register("otp")} />
        <button className="w-full rounded bg-krikso-500 p-3 text-white">Verify</button>
      </form>
    </div>
  );
}

