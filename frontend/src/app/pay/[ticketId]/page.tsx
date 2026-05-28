import PayPenaltyLookup from "@/components/qr/PayPenaltyLookup";

interface PayTicketPageProps {
  params: {
    ticketId: string;
  };
}

export default function PayTicketPage({ params }: PayTicketPageProps) {
  return <PayPenaltyLookup initialTicket={params.ticketId} />;
}
