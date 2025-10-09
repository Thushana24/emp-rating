export enum EAssignedEmployees {
  FETCH_ALL = 1,
}

export const AssignedEmployeesKey: Record<EAssignedEmployees, string> = {
  [EAssignedEmployees.FETCH_ALL]: "get-all-assigned-employees",
};
