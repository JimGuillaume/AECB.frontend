export interface Team {
    id: number;
    name : string;
    specialization : string;
    parent_team_id : number | null | undefined;
}

export interface TeamWithMembers extends Team {
    memberIds : number [];
}