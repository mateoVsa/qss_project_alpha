export function validateGuest(guest) {
  if (!guest.nombres || !guest.cedula) {
    return false;
  }
  return true;
}
