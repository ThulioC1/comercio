import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

const appointments = [
    { name: 'Olivia Martin', email: 'olivia.martin@email.com', service: 'Corte Masculino', time: '10:00', avatar: 'https://picsum.photos/seed/a1/40/40'},
    { name: 'Jackson Lee', email: 'jackson.lee@email.com', service: 'Barba', time: '11:00', avatar: 'https://picsum.photos/seed/a2/40/40' },
    { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', service: 'Corte e Barba', time: '14:00', avatar: 'https://picsum.photos/seed/a3/40/40' },
    { name: 'William Kim', email: 'will@email.com', service: 'Corte Infantil', time: '15:00', avatar: 'https://picsum.photos/seed/a4/40/40' },
    { name: 'Sofia Davis', email: 'sofia.davis@email.com', service: 'Manicure', time: '16:00', avatar: 'https://picsum.photos/seed/a5/40/40' },
]

export default function RecentAppointments() {
  return (
    <div className="space-y-8">
      {appointments.map((appt) => (
          <div key={appt.email} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={appt.avatar} alt="Avatar" />
              <AvatarFallback>{appt.name.substring(0,2)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{appt.name}</p>
              <p className="text-sm text-muted-foreground">{appt.email}</p>
            </div>
            <div className="ml-auto font-medium text-right">
                <div>{appt.service}</div>
                <div className="text-sm text-muted-foreground">{appt.time}</div>
            </div>
          </div>
      ))}
    </div>
  )
}
