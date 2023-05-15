import { CommentItem } from '@/types/common-types';

export default interface LabViewData {
  lab: LabData;
  comments: CommentItem[];
  supercomments: CommentItem[];
  follow: []; // ?
  sum_picks: null;
  my_votes: number;
  uid: string;
}

export interface LabData {
  nid: string;
  created: string; // timestamp; change to int?
  title: string;
  body: string;
  uid: string;
  puzzles: RoundData[];
  is_featured: null;
  coadmins: string[]; // uids
  project_type: null;
  winner: string; // "1"
  exp_phase: string; // "2"
  exp_phase_start: null;
  exp_phase_end: null;
  synthesis_date: null;
  proposed_date: null;
  affiliation: string;
  email: string;
  selection: null;
  pending: null;
  voters: null;
  cover_image: string;
  conclusion: null;
  coadmin_names: string[];
  username: string; // of whome?
  synthesized_solutions: [];
  current_cloud_round: number;
  curr_time: number;
}

export interface PuzzleData {
  nid: string;
  title: string;
  secstruct: string;
  sequence: string;
  rna_type: string;
  object: string;
  constraint: string;
  cover_image: null;
  num_slots: number;
  constraints: string;
  switch_struct?: string[];
  synthesized_solutions: [];
  num_solutions: number;
  my_votes: number;
  submitted: number;
  num_synthesized: number;
}

export interface RoundData {
  puzzles: PuzzleData[]
  round: number;
  is_playable: boolean;
}
