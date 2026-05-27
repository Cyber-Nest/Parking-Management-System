import type { OfficerTicket } from "@/services/officer-enforcement.service";

export function getReviewBlockMessage(ticket: OfficerTicket | null | undefined): string | null {
  if (!ticket) return null;
  if (ticket.status === "paid") {
    return "Reviews cannot be sent for paid tickets. Only unpaid or disputed tickets can be sent for review.";
  }
  if (ticket.status === "cancelled") {
    return "Reviews cannot be sent for cancelled tickets.";
  }
  if (ticket.status === "resolved") {
    return "Reviews cannot be sent for resolved tickets.";
  }
  return null;
}

export function canSendTicketToReview(ticket: OfficerTicket | null | undefined): boolean {
  return !getReviewBlockMessage(ticket);
}
