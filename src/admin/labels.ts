import type { Availability } from '../catalog/types'

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: 'Disponível',
  on_request: 'A confirmar',
  unavailable: 'Indisponível',
}
