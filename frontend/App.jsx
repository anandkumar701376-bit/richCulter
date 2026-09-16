import PublicLayout from "./src/pages/public/PublicLayout";
import DataEntryLayout from "./src/layoutes/DataEntryLayout";

export default function App() {
  const isDataEntry =
    window.location.hash === "#data-entry";

  if (isDataEntry) {
    return <DataEntryLayout />;
  }

  return <PublicLayout />;
}