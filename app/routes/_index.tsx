import { Link } from "react-router";

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Shape Drawing App
          </h1>
        </header>
        <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <p className="leading-6 text-gray-700 dark:text-gray-200">
            Choose your canvas:
          </p>
          <ul className="space-y-2">
            <li>
              <Link
                className="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 underline hover:no-underline dark:text-blue-500"
                to="/canvas-shapes"
              >
                📐 Original Canvas (Single Shape)
              </Link>
            </li>
            <li>
              <Link
                className="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 underline hover:no-underline dark:text-blue-500"
                to="/canvas-shapes-new"
              >
                🎨 New Canvas (Multi-Shape + Reducer)
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}