const express = require('express');
const cors = require('cors')
const {Pool} = require('pg');

const app=express()
app.use(express.json())
app.use(cors())
const pool=new Pool({
    user:"postgres",
    host:"localhost",
    database:"postgres",
    password:"guru",
    port:5432,
})

pool.connect()

.then(client=>{
    console.log("Database created successfully");
    client.release()
})
.catch(error=>{
console.error("Failed to connection database",error)    
})

// create table
app.get("/create-table",async (req,res)=>{
const createTableQuery=`
CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      course_name TEXT NOT NULL,
      professor TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL`
      const createAssignmentsTableQuery = `
      CREATE TABLE IF NOT EXISTS assignments (
          id SERIAL PRIMARY KEY,
          course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          due_date DATE NOT NULL,
          status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending'
      );
  `

      try{
            await pool.query(createTableQuery)
            await pool.query(createAssignmentsTableQuery)
            console.log("table created successfully");
            
            res.status(200).send({message:'Table "courses" and "assignments" created successfully'})
      }catch(error){
        console.log("error creating table",error);
        res.status(400).send({message:"Table creation error"})
      }
})



// add courses
app.post("/add-course", async (req, res) => {
    const { course_name, professor, start_date, end_date } = req.body;
    const convertToISODate = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`; 
    };

    const formatToISO = (date) => {
        const convertedDate = convertToISODate(date);
        const parsedDate = new Date(convertedDate);
        if (isNaN(parsedDate)) {
            throw new Error("Invalid date format");
        }
        return parsedDate.toISOString(); 
    };

    try {
        const isoStartDate = formatToISO(start_date);
        const isoEndDate = formatToISO(end_date);

        const insertCourseQuery = `
            INSERT INTO courses (course_name, professor, start_date, end_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;

        const result = await pool.query(insertCourseQuery, [
            course_name,
            professor,
            isoStartDate,
            isoEndDate,
        ]);

        console.log("Course added successfully:", result.rows[0]);
        res.status(201).send({ message: "Course added successfully", course: result.rows[0] });
    } catch (error) {
        console.error("Error adding course", error);
        res.status(400).send({ message: "Error adding course", error: error.message });
    }
});


// show all courses
app.get("/courses",async (req,res)=>{
    const getAllCourses=`
   SELECT * FROM courses
   ORDER BY id ASC
    `
    try{
        const result=await pool.query(getAllCourses)
        console.log("All course getting successfully:", result.rows);
        
        res.status(200).send({message:"Get all the courses",courses:result.rows})
    }catch(error){
console.error("error getting all courses",error)
res.status(400).send({message:"error getting all courses"})
    }
})

// get single course 
app.get("/courses/:id",async (req,res)=>{
    const {id}=req.params
    const getSpecifiedCourse=`
   SELECT * FROM courses
   WHERE id=$1
    `
    try{
        const result=await pool.query(getSpecifiedCourse,[id])

        if(result.rows.length===0){
            console.log("Course not found");
            res.status(404).send({message:"course not found"})
        }
        else{
            console.log(" course getting successfully:", result.rows[0]);
        
            res.status(200).send({message:"Get specified course",courses:result.rows[0]})
        }
        
    }catch(error){
console.error("error getting  specified course",error)
res.status(400).send({message:"error getting specified courses"})
    }
})

// update specified course
app.put("/update-course/:id",async (req,res)=>{
    const {id}=req.params
    const {course_name,professor,start_date,end_date}=req.body
    
    const updateCourseQuery=`
    UPDATE courses
    SET course_name=$1,professor=$2,start_date=$3,end_date=$4
    WHERE id=$5
   RETURNING *
    `
    try{
        const result=await pool.query(updateCourseQuery,[course_name,professor,start_date,end_date,id])
        if(result.rows.length===0){
            console.log("course not found")
            res.status(404).send({message:"Course not found"})
        }
        else{
            console.log("course updated successfully")
            res.status(200).send({message:"course updated successfully",course:result.rows[0]})
        }

    }catch(error){
        console.error("Error updating course", error)
        res.status(400).send({ message: "Error updating course" })
    }
})


// Delete course 
app.delete("/delete-course/:id",async (req,res)=>{
const {id}=req.params
const deleteSpecifiedCourse=`
DELETE FROM courses
WHERE id=$1
RETURNING *;
`
try{
    const result=await pool.query(deleteSpecifiedCourse,[id])
    const deletedCourse=result.rows[0].course_name
console.log("course deleted successfully",deletedCourse);
res.status(200).send({message:`${deletedCourse} deleted successfully,`})

}catch(error){
    console.log("course deleting error");
    res.status(404).send({message:"course deleting error"})
    
}
})


// assignment data
app.post("/assignments", async (req, res) => {
    const { course_id, title, due_date, status } = req.body;
    const insertAssignmentQuery = `
        INSERT INTO assignments (course_id, title, due_date, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    try {
        const result = await pool.query(insertAssignmentQuery, [course_id, title, due_date, status || 'pending']);
        res.status(201).send({ message: "Assignment added successfully", assignment: result.rows[0] });
    } catch (error) {
        console.error("Error adding assignment", error);
        res.status(400).send({ message: "Error adding assignment" });
    }
});

// Get all assignments
app.get("/assignments", async (req, res) => {
    const getAllAssignmentsQuery = `SELECT * FROM assignments ORDER BY id ASC`;
    try {
        const result = await pool.query(getAllAssignmentsQuery);
        res.status(200).send({ message: "All assignments retrieved successfully", assignments: result.rows });
    } catch (error) {
        console.error("Error retrieving assignments", error);
        res.status(400).send({ message: "Error retrieving assignments" });
    }
});

// Get assignment
app.get("/assignments/:id", async (req, res) => {
    const { id } = req.params;
    const getAssignmentQuery = `SELECT * FROM assignments WHERE id = $1`;
    try {
        const result = await pool.query(getAssignmentQuery, [id]);
        if (result.rows.length === 0) {
            res.status(404).send({ message: "Assignment not found" });
        } else {
            res.status(200).send({ message: "Assignment retrieved successfully", assignment: result.rows[0] });
        }
    } catch (error) {
        console.error("Error retrieving assignment", error);
        res.status(400).send({ message: "Error retrieving assignment" });
    }
});

// Update assignment
app.put("/assignments/:id", async (req, res) => {
    const { id } = req.params;
    const { title, due_date, status } = req.body;
    const updateAssignmentQuery = `
        UPDATE assignments
        SET title = $1, due_date = $2, status = $3
        WHERE id = $4
        RETURNING *
    `
    try {
        const result = await pool.query(updateAssignmentQuery, [title, due_date, status, id]);
        if (result.rows.length === 0) {
            res.status(404).send({ message: "Assignment not found" });
        } else {
            res.status(200).send({ message: "Assignment updated successfully", assignment: result.rows[0] });
        }
    } catch (error) {
        console.error("Error updating assignment", error);
        res.status(400).send({ message: "Error updating assignment" });
    }
});

// Delete assignment 
app.delete("/assignments/:id", async (req, res) => {
    const { id } = req.params;
    const deleteAssignmentQuery = `DELETE FROM assignments WHERE id = $1 RETURNING *;`;
    try {
        const result = await pool.query(deleteAssignmentQuery, [id]);
        if (result.rows.length === 0) {
            res.status(404).send({ message: "Assignment not found" });
        } else {
            res.status(200).send({ message: "Assignment deleted successfully", assignment: result.rows[0] });
        }
    } catch (error) {
        console.error("Error deleting assignment", error);
        res.status(400).send({ message: "Error deleting assignment" });
    }
});

app.listen(8000,'0.0.0.0',()=>{
    console.log("server is running at http://localhost:8000");
    
})