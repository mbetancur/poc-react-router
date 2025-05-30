import { db } from "~/db/db";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/organization.$id";

interface Organization {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function loader({ params }: Route.LoaderArgs) {
  const org = await db.getOrganization(Number(params.id));
  if (!org) {
    throw new Response("Not Found", { status: 404 });
  }
  return org;
}

export default function Organization({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const org = loaderData ? (loaderData as Organization) : null;
  const currentSort = searchParams.get('sort') || 'id';

  const updateSort = (sortBy: 'id' | 'name') => {
    setSearchParams(prev => {
      prev.set('sort', sortBy);
      return prev;
    });
  };

  if (!org) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex p-4 gap-4 flex-col w-1/3">
      <h1 className="text-4xl font-bold mb-4">View Organization</h1>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Sort by:</span>
        <button 
          className={`px-3 py-1 rounded-md ${currentSort === 'id' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => updateSort('id')}
        >
          ID
        </button>
        <button 
          className={`px-3 py-1 rounded-md ${currentSort === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => updateSort('name')}
        >
          Name
        </button>
      </div>
      <div className="mt-4">
        <div className="font-semibold">Organization Details:</div>
        <div>ID: {org.id}</div>
        <div>Name: {org.name}</div>
      </div>
    </div>
  );
}
