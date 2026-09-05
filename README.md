# RateStore

A Full Stack Store Rating Platform built as part of the FullStack Intern Coding Challenge.

## Live Demo

🌐 **[https://ratestore-azure.vercel.app/](https://ratestore-azure.vercel.app/)**


## Project Overview

The Rating Platform is a web application where users can view registered stores and submit ratings from 1 to 5 stars.

The application uses a single login system with role-based functionality for three types of users:

1. Normal User
2. Store Owner
3. System Administrator

## Features

### Normal User

- Sign up and login
- View available stores
- Search stores by name or address
- View store address and overall rating
- View their submitted rating
- Submit a rating from 1 to 5
- Modify an existing rating
- Update password
- Logout

### Store Owner

- Login using the common login system
- Update password
- View users who have rated their store
- View the average rating of their store
- Logout

### System Administrator

- Login using the common login system
- Add new stores
- Add normal users
- Add administrator users
- View dashboard statistics
- View total users, stores and ratings
- View and filter users
- View and filter stores
- View user details
- View store owner rating information
- Logout

## Test Login Credentials

The following accounts can be used to test the application:

| No. | Role | Email | Password |
|-----|------|-------|----------|
| 1 | Normal User | `akshay.shinde@gmail.com` | `Password@123` |
| 2 | Store Owner | `nitin.owner@gmail.com` | `Password@123` |
| 3 | System Administrator | `darekaryash123@gmail.com` | `yash123` |

> These credentials are provided for testing the application.

## Validation

The application follows the validation requirements specified in the challenge:

- **Name:** Minimum 20 characters and maximum 60 characters
- **Address:** Maximum 400 characters
- **Password:** 8–16 characters with at least one uppercase character and one special character
- **Email:** Standard email validation
- **Rating:** Rating must be between 1 and 5

## Technology Stack

### Frontend

- React.js
- Tailwind CSS
- Lucide React

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

## Database Structure

The application uses three main tables:

### Users

Stores all users of the application.

Users are identified using a role:

- `USER` - Normal User
- `OWNER` - Store Owner
- `ADMIN` - System Administrator

### Stores

Stores information about registered stores.

Each store is associated with a Store Owner using `owner_id`.

### Ratings

Stores ratings submitted by Normal Users for stores.

A user can submit one rating for a particular store and can modify that rating later.

## Role Flow

```text
                         Login
                           |
                           v
                     Users Table
                           |
                     Check Role
                    /     |      \
                   /      |       \
                  v       v        v
                USER    OWNER     ADMIN
                 |        |         |
                 v        v         v
               User     Owner      Admin
             Dashboard Dashboard Dashboard