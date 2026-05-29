import PayPenaltyLookup from "@/components/qr/PayPenaltyLookup";

interface PayTicketPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export default async function PayTicketPage({ params }: PayTicketPageProps) {
  const { ticketId } = await params;
  return <PayPenaltyLookup initialTicket={ticketId} />;
}
