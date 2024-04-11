********************** E-Learning Platform Backend API Doc *******************************

Project Requirements 

The project requirements are outlined in detail in the provided project overview. Key features include user registration, course management, user enrollment, filtering and pagination, database integration, security, authentication, error handling, and logging.

API Endpoints 

--------- User APIs --------

- User Registration

Endpoint: POST /user/register
Description: Allows users to register by providing necessary details such as name, email, and password.
Request Body: { "name": "string", "email": "string", "password": "string" }
Response: { "message": "User registered successfully", "user": { "_id": "string", "name": "string", "email": "string" } }

- User Login

Endpoint: POST /user/login
Description: Allows users to login by providing necessary details such as email, and password.
Request Body: { "email": "string", "password": "string" }
Response: { "success": true, "message": "User logged in successfully" }


- User Profile

Endpoint: GET /user/profile (Get current user's profile)
Description: Enables user to view their profile information.
Response: { "_id": "string", "name": "string", "email": "string" } etc.


- User Edit Profile

Endpoint: UPDATE /user/profile/edit (update current user's profile)
Description: Enables user to view their profile information.
Request Body: {
    "name": string,
    "password": string,
    "profilePicture": string,
    "dateOfBirth": string,
    "gender": string,
    "country": string,
    "city": string,
    "bio": string,
    "interests": array
}
Response: { "_id": "string", "name": "string", "email": "string" } etc.


------------ Course APIs ------------

- Get Courses

Endpoint: GET /courses
Description: Fetches courses available on the platform with optional filtering and pagination.
Request Body (Optional): // apply filters
{
    "course": "",
    "level": "", // beginner, intermidiate, advanced
    "category": "", //like "web developer", "app developer", "DevOps"     
    "location" : "", // online, offline, mumbai, kerla, pune etc.
    "language": "",
    "duration": "",
    "freeOrPaid": "", // set the value free or paid as you want,
    "provider": "",
    "popularity": ""
}
Query Parameters: page=1 or page=2 whatever...
Response: Array of course objects


-------------- CRUD Operations for Superadmin --------------

- Endpoints:

- super admin register

POST /super-admin/register (create super admin register, at leas two superadmin should be there)
Request Body: {
    "username": "String",
    "email": "String",
    "password": "String"
}
Response: { "success": true, "message": "Superadmin registered successful..." }


- super admin login

POST /super-admin/login 
Request Body: {
    "username": "String",
    "password": "String"
}
Response: { "success": true, "message": "Superadmin logged in successful..." }


- create course

POST /super-admin/course/create (Create a new course)
Request Body:  {
    "title": "String",
    "description": "String",
    "duration": "String",
    "level": "String",
    "category": "String",
    "price": "String",
    "freeOrPaid": "String",
    "enrolledStudents": "String",
    "rating": "String",
    "provider": "String",
    "instructorExperience": Number,
    "reviews": Number,
    "outcome": "String",
    "accessibility": Boolean,
    "location": "String"
}
Response: { "success": true, "message": "Course created successfully..." }


- get a course

GET /super-admin/course/:id (Get a course details)
Query params: give the course id. 
Response: { "success": true, course: [{}] or {} }


- update course

PATCH /super-admin/course/edit (Update course details)
Request Body:  {
    "_id": "String",
    "title": "String",
    "description": "String",
    "duration": "String",
    "level": "String",
    "category": "String",
    "price": "String",
    "freeOrPaid": "String",
    "enrolledStudents": "String",
    "rating": "String",
    "provider": "String",
    "instructorExperience": Number,
    "reviews": Number,
    "outcome": "String",
    "accessibility": Boolean,
    "location": "String"
}
Response: { "success": true, "message": "Course updated successfully..." }

- delete course

DELETE /super-admin/course/delete (Delete a course)
Request Body: { "_id": "String" }
Response: { "success": true, "message": "Course deleted successfully..." }

Description: Superadmin users can perform CRUD operations on courses.


------------- User Enrollment APIs ------------- 

- Course Enrollment

Endpoint: POST /user/enrole
Description: Allows users to enroll in courses they are interested in.
Request Body: { "courseId": "string" }
Response: {  success: true, msg: 'User enrolled in this course successfully' } 

- View Enrolled Courese

Endpoint: GET /user/view-enrolled/courses
Description: view all courses which you enrolled in.
Response: array of object.

--------------- Run command --------------- 

run the following command into your terminal or cmd

npm run start

And you will see this in the terminal

server running at http://localhost:3000
connected to mongodb
