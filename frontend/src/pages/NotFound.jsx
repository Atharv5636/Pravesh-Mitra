import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="space-y-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Go Home
      </Link>
    </section>
  );
}

export default NotFound;
