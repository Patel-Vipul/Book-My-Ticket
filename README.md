# Book My Ticket

Book My Ticket is a full-stack movie ticket booking application built to simulate a real-world ticket reservation platform. The application allows users to browse movies, select seats, create bookings, and confirm reservations through an intuitive interface.

This project was developed to gain hands-on experience with backend development, authentication, database design, deployment, and full-stack application architecture.

## Live Demo

* Frontend: https://book-my-tickett.netlify.app
* Backend API: https://book-my-ticket-yz80.onrender.com

## Features

### User Features

* User Registration
* User Login
* JWT Authentication
* Browse Available Movies
* View Seat Availability
* Create Seat Bookings
* Confirm Bookings
* Cancel Pending Bookings

### Admin Features

* Add Movies
* Delete Movies
* Manage Movie Listings
* Role-Based Access Control

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL

### Deployment

* Neon (PostgreSQL Hosting)
* Render (Backend Hosting)
* Netlify (Frontend Hosting)

### Tools & Libraries

* JWT
* bcrypt
* pg
* Docker
* Cookie Parser
* CORS

## Project Architecture

```text
User
   ↓
Frontend (Netlify)
   ↓
Backend API (Render)
   ↓
PostgreSQL (Neon)
```

## Project Structure

```text
Book-My-Ticket/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── src/
│   ├── auth/
│   ├── booking/
│   ├── movie/
│   ├── common/
│   └── ...
│
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/Patel-Vipul/Book-My-Ticket.git
cd Book-My-Ticket
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file and add the following variables:

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_EXPIRY=
```

### Run the Application

#### Development

```bash
npm run dev
```

#### Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/logout`

### Movies

* `GET /movies`
* `POST /movies`
* `DELETE /movies/:movieId`

### Bookings

* `POST /bookings`
* `POST /bookings/:bookingId/confirm`
* `DELETE /bookings/:bookingId`

## Known Issues

* Reserved seats are currently displayed as booked in the frontend.
* Pending bookings are not automatically released after the 10-minute timer expires.
* Automatic cleanup of expired bookings has not been implemented.

## Future Enhancements

* Automatic seat expiration.
* Background jobs for booking cleanup.
* Real-time seat updates using WebSockets.
* Email notifications.
* Payment gateway integration.
* Enhanced admin dashboard.

## Learning Outcomes

This project helped me gain practical experience with:

* Node.js and Express.js
* TypeScript
* PostgreSQL
* Docker
* JWT Authentication
* REST APIs
* Git and GitHub
* Cloud Databases
* Full-Stack Deployment
* Software Architecture

## Author

### Vipul Patel

* GitHub: https://github.com/Patel-Vipul

## License

This project was developed for educational and learning purposes.
