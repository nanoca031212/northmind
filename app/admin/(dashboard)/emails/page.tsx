import { getCustomerEmails } from "@/lib/actions";
import AdminEmailsClient from "@/components/admin/AdminEmails";

export default async function AdminEmailsPage() {
  const customers = await getCustomerEmails();
  return <AdminEmailsClient initialCustomers={customers} />;
}
