import Container from "@/components/layout/Container";
import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="py-12">
      <Container>
        <LoginForm />
      </Container>
    </main>
  );
}