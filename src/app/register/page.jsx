import RegisterClient from "./RegisterClient";
import connectDB from "../../lib/mongodb";
import Settings from "../../models/Settings";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Register | TECHNOPHILIA 3.0",
};

export default async function Register() {
  await connectDB();
  let settings = await Settings.findOne({});
  if (!settings) {
    settings = await Settings.create({ isRegistrationOpen: true });
  }

  if (!settings.isRegistrationOpen) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b0b0b",
        color: "#fff",
        fontFamily: "'Georgia', serif",
        padding: "20px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "1rem", color: "#e63946", fontWeight: "600", textTransform: "uppercase", letterSpacing: "2px" }}>
          Registration Closed
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#d4d4d4", maxWidth: "600px", lineHeight: "1.6", fontFamily: "sans-serif" }}>
          Sorry, the registration has been closed due to full slots. Thank you for your overwhelming response!
        </p>
        <Link href="/" style={{
          marginTop: "2.5rem",
          padding: "14px 28px",
          backgroundColor: "#ff4d4d",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "50px",
          fontWeight: "600",
          fontFamily: "sans-serif",
          textTransform: "uppercase",
          letterSpacing: "1px",
          boxShadow: "0 4px 15px rgba(255, 77, 77, 0.3)",
          transition: "all 0.3s ease"
        }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  return <RegisterClient />;
}
