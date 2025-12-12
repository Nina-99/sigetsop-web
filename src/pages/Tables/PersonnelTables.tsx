import {
  ComponentCard,
  PageBreadCrumb,
  PageMeta,
  PersonnelTable,
} from "../../components";

export default function PersonnelTables() {
  return (
    <>
      <PageMeta
        title="Sigetsop - Table"
        description="This is Tables Dashboard Personnel page"
      />
      <PageBreadCrumb pageTitle="Personal Policial" />
      <div className="space-y-6">
        <ComponentCard title="Tabla Personnel">
          <PersonnelTable />
        </ComponentCard>
      </div>
    </>
  );
}
