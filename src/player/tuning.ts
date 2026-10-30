export interface Tuning {
  walkSpeed: number; runSpeed: number; accel: number; airAccel: number;
  friction: number; gravity: number; jumpImpulse: number; jumpHoldForce: number;
  coyoteTime: number; capThrowSpeed: number; capReturnSpeed: number;
  capJumpImpulse: number; diveImpulse: number; groundPoundSpeed: number;
}
export const TUNING: Tuning = {
  walkSpeed: 3.2, runSpeed: 7.4, accel: 26, airAccel: 10,
  friction: 16, gravity: 34, jumpImpulse: 11.5, jumpHoldForce: 44,
  coyoteTime: 0.12, capThrowSpeed: 19, capReturnSpeed: 26,
  capJumpImpulse: 9.5, diveImpulse: 12.5, groundPoundSpeed: 30,
};