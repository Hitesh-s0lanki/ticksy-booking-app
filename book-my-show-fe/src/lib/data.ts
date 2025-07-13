export const movie = {
  id: 1,
  title: "Spider-Man: No Way Home",
  genre: "Action/Adventure/Sci-Fi",
  rating: 8.7,
  duration: "148 min",
  language: "English",
  releaseDate: "2021-12-17",
  director: "Jon Watts",
  cast: ["Tom Holland", "Zendaya", "Benedict Cumberbatch", "Jacob Batalon"],
  synopsis:
    "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.",
  image: "/movies/spider.jpg",
  trailerUrl: "https://www.youtube.com/embed/JfVOs4VSpmA",
  theaters: [
    {
      id: 1,
      name: "PVR Cinemas - Phoenix Mall",
      location: "Lower Parel, Mumbai",
      showtimes: ["10:30 AM", "1:45 PM", "5:00 PM", "8:15 PM", "11:30 PM"],
      seatTypes: [{ type: "Silver", price: 180 }],
    },
    {
      id: 2,
      name: "INOX - R City Mall",
      location: "Ghatkopar, Mumbai",
      showtimes: ["11:00 AM", "2:15 PM", "5:30 PM", "8:45 PM"],
      seatTypes: [{ type: "Silver", price: 160 }],
    },
  ],
};

export const movies = [
  {
    id: 1,
    title: "Spider-Man: No Way Home",
    genre: "Action/Adventure",
    rating: 8.7,
    duration: "148 min",
    language: "English",
    image: "/movies/spider.jpg",
  },
  {
    id: 2,
    title: "The Batman",
    genre: "Action/Crime",
    rating: 7.8,
    duration: "176 min",
    language: "English",
    image:
      "https://images.unsplash.com/photo-1715316110001-c2374d87e753?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    title: "Doctor Strange",
    genre: "Action/Fantasy",
    rating: 7.3,
    duration: "126 min",
    language: "English",
    image:
      "https://images.unsplash.com/photo-1617978441921-29f82b7aee2b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHIlMjBzdHJhbmdlfGVufDB8fDB8fHww",
  },
  {
    id: 4,
    title: "Top Gun: Maverick",
    genre: "Action/Drama",
    rating: 8.3,
    duration: "130 min",
    language: "English",
    image:
      "https://plus.unsplash.com/premium_photo-1661869126805-269f83e44a87?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dG9wJTIwR3VufGVufDB8fDB8fHww",
  },
  {
    id: 6,
    title: "Black Panther",
    genre: "Action/Adventure",
    rating: 7.3,
    duration: "134 min",
    language: "English",
    image:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=450&fit=crop",
  },
  {
    id: 7,
    title: "Dune",
    genre: "Sci-Fi/Drama",
    rating: 8.0,
    duration: "155 min",
    language: "English",
    image:
      "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=450&fit=crop",
  },
  {
    id: 8,
    title: "Joker",
    genre: "Crime/Drama",
    rating: 8.4,
    duration: "122 min",
    language: "English",
    image:
      "https://images.unsplash.com/photo-1620510625142-b45cbb784397?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8am9rZXJ8ZW58MHx8MHx8fDA%3D",
  },
];

export const upcomingBookings = [
  {
    id: 1,
    type: "movie",
    title: "Spider-Man: No Way Home",
    date: "2024-08-20",
    time: "8:15 PM",
    venue: "PVR Cinemas - Phoenix Mall",
    seats: ["A12", "A13"],
    amount: 760,
    bookingId: "BMS001234",
    image: "/movies/spider.jpg",
  },
  {
    id: 2,
    type: "event",
    title: "Music Festival 2024",
    date: "2024-08-25",
    time: "6:00 PM",
    venue: "Central Park",
    seats: ["GA-001"],
    amount: 1500,
    bookingId: "BMS001235",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=300&fit=crop",
  },
];

export const pastBookings = [
  {
    id: 3,
    type: "movie",
    title: "The Batman",
    date: "2024-08-10",
    time: "5:00 PM",
    venue: "INOX - R City Mall",
    seats: ["B8", "B9"],
    amount: 560,
    bookingId: "BMS001230",
    image:
      "https://images.unsplash.com/photo-1608889335941-32ac5f2041de?w=200&h=300&fit=crop",
  },
  {
    id: 4,
    type: "sports",
    title: "Football Championship",
    date: "2024-08-05",
    time: "4:00 PM",
    venue: "Stadium Arena",
    seats: ["Block A - Row 5 - Seat 12"],
    amount: 2000,
    bookingId: "BMS001228",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200&h=300&fit=crop",
  },
];

export const events = [
  {
    id: 1,
    title: "Music Festival 2024",
    category: "Music",
    date: "2024-08-20",
    venue: "Central Park",
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Comedy Night Live",
    category: "Comedy",
    date: "2024-08-18",
    venue: "Comedy Club",
    price: 800,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
  },
  {
    id: 3,
    title: "Art Exhibition Opening",
    category: "Art",
    date: "2024-08-25",
    venue: "Art Gallery",
    price: 500,
    image:
      "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=300&h=200&fit=crop",
  },
  {
    id: 4,
    title: "Tech Conference 2024",
    category: "Technology",
    date: "2024-09-01",
    venue: "Convention Center",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
  },
  {
    id: 5,
    title: "Food & Wine Festival",
    category: "Food",
    date: "2024-08-22",
    venue: "Waterfront Park",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop",
  },
  {
    id: 6,
    title: "Dance Workshop",
    category: "Dance",
    date: "2024-08-19",
    venue: "Dance Studio",
    price: 600,
    image:
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=200&fit=crop",
  },
  {
    id: 7,
    title: "Literary Meet",
    category: "Literature",
    date: "2024-08-26",
    venue: "Library Hall",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
  },
  {
    id: 8,
    title: "Photography Exhibition",
    category: "Art",
    date: "2024-08-28",
    venue: "Gallery Space",
    price: 400,
    image:
      "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=300&h=200&fit=crop",
  },
];

export const sports = [
  {
    id: 1,
    title: "Football Championship Final",
    sport: "Football",
    date: "2024-08-22",
    venue: "Stadium Arena",
    teams: "Mumbai Lions vs Delhi Tigers",
    price: 2000,
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Basketball Finals",
    sport: "Basketball",
    date: "2024-08-28",
    venue: "Sports Complex",
    teams: "Bangalore Hawks vs Chennai Eagles",
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop",
  },
  {
    id: 3,
    title: "Cricket T20 Match",
    sport: "Cricket",
    date: "2024-08-25",
    venue: "Cricket Stadium",
    teams: "Royal Challengers vs Knight Riders",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=300&h=200&fit=crop",
  },
  {
    id: 4,
    title: "Tennis Championship",
    sport: "Tennis",
    date: "2024-09-01",
    venue: "Tennis Court",
    teams: "Singles Final",
    price: 1800,
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
  },
  {
    id: 5,
    title: "Swimming Championship",
    sport: "Swimming",
    date: "2024-08-30",
    venue: "Aquatic Center",
    teams: "State Championship",
    price: 800,
    image:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=200&fit=crop",
  },
  {
    id: 6,
    title: "Boxing Match",
    sport: "Boxing",
    date: "2024-08-26",
    venue: "Boxing Arena",
    teams: "Title Fight",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&h=200&fit=crop",
  },
];
