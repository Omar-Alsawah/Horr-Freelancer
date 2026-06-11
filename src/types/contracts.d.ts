export interface AttachmentDto {
  id: string;
  name: string;
  url: string;
  type: 'FILE' | 'LINK';
}

export interface DeliveryDto {
  id: string | number;
  contractId: string | number;
  milestoneId?: string | number;
  deliveryNote: string;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'RevisionRequested' | 'Disputed';
  attachments: AttachmentDto[];
  escrowAmount: number;
  reviewDeadline?: string;
}

export interface MilestoneDto {
  id: string | number;
  title: string;
  amount: number;
  deadline?: string;
  status: 'Unfunded' | 'Funded' | 'Delivered' | 'Released';
}

export interface ContractDto {
  id: string | number;
  jobTitle: string;
  clientName: string;
  freelancerName: string;
  agreedRate: number;
  startDate: string;
  status: 'Active' | 'Completed';
  description: string;
  escrowFunded: boolean;
  milestones?: MilestoneDto[];
}

export interface DeliverWorkPayload {
  contractId: string | number;
  milestoneId?: string | number;
  deliveryNote?: string;
  attachments?: File[];
  links?: string[];
}
