import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned': return 'bg-blue-100 text-blue-800';
    case 'ongoing': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'planned': return 'Planifié';
    case 'ongoing': return 'En cours';
    case 'completed': return 'Terminé';
    case 'cancelled': return 'Annulé';
    default: return 'Inconnu';
  }
};

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  } catch {
    return dateString;
  }
};
