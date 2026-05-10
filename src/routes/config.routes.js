const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/config/classes - Get all classes
router.get('/classes', async (req, res, next) => {
  try {
    // Check if classes table exists, otherwise return hardcoded values
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');

    if (error) {
      // If table doesn't exist, return hardcoded classes
      console.log('Classes table not found, using hardcoded values:', error.message);
      const hardcodedClasses = ['Nursery', 'LKG', 'UKG'];
      return res.json(successResponse(hardcodedClasses, 'Classes fetched successfully (hardcoded)'));
    }

    // If table exists but is empty, return hardcoded values
    if (!classes || classes.length === 0) {
      const hardcodedClasses = ['Nursery', 'LKG', 'UKG'];
      return res.json(successResponse(hardcodedClasses, 'Classes fetched successfully (hardcoded)'));
    }

    res.json(successResponse(classes, 'Classes fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/config/class-stats - Get class statistics with student count and teachers
router.get('/class-stats', async (req, res, next) => {
  try {
    const { supabaseAdmin } = require('../config/database');
    
    // Fetch all students with their class, section, and teacher info
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        class,
        section,
        teacher:teacher_id (
          id,
          full_name
        )
      `);

    if (studentsError) {
      console.error('Failed to fetch students for class stats:', studentsError);
      throw errorResponse('Failed to fetch class statistics', 500);
    }

    // Group students by class and calculate statistics
    const classStatsMap = {};

    students.forEach(student => {
      const className = student.class || 'Unknown';
      
      if (!classStatsMap[className]) {
        classStatsMap[className] = {
          name: className,
          studentCount: 0,
          sections: new Set(),
          teachers: new Set()
        };
      }

      classStatsMap[className].studentCount++;
      
      if (student.section) {
        classStatsMap[className].sections.add(student.section);
      }
      
      if (student.teacher?.full_name) {
        classStatsMap[className].teachers.add(student.teacher.full_name);
      }
    });

    // Convert to array and format
    const classStats = Object.values(classStatsMap).map(cls => ({
      name: cls.name,
      studentCount: cls.studentCount,
      sections: Array.from(cls.sections).sort(),
      teachers: Array.from(cls.teachers).sort()
    }));

    // Sort by class name
    classStats.sort((a, b) => {
      const order = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json(successResponse(classStats, 'Class statistics fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/config/sections - Get all sections
router.get('/sections', async (req, res, next) => {
  try {
    // Check if sections table exists, otherwise return hardcoded values
    const { data: sections, error } = await supabase
      .from('sections')
      .select('*')
      .order('name');

    if (error) {
      // If table doesn't exist, return hardcoded sections
      console.log('Sections table not found, using hardcoded values:', error.message);
      const hardcodedSections = ['A', 'B', 'C'];
      return res.json(successResponse(hardcodedSections, 'Sections fetched successfully (hardcoded)'));
    }

    // If table exists but is empty, return hardcoded values
    if (!sections || sections.length === 0) {
      const hardcodedSections = ['A', 'B', 'C'];
      return res.json(successResponse(hardcodedSections, 'Sections fetched successfully (hardcoded)'));
    }

    res.json(successResponse(sections, 'Sections fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/config/departments - Get all departments
router.get('/departments', async (req, res, next) => {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      throw errorResponse('Failed to fetch departments', 500);
    }

    res.json(successResponse(departments, 'Departments fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/config/designations - Get all designations
router.get('/designations', async (req, res, next) => {
  try {
    const { data: designations, error } = await supabase
      .from('designations')
      .select('*')
      .order('name');

    if (error) {
      throw errorResponse('Failed to fetch designations', 500);
    }

    res.json(successResponse(designations, 'Designations fetched successfully'));

  } catch (error) {
    next(error);
  }
});

// GET /api/config/constants - Get all constants
router.get('/constants', async (req, res, next) => {
  try {
    const constants = {
      roles: {
        ADMIN: 8,
        FACULTY: 6,
        STUDENT: 19
      },
      bloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      attendanceStatus: ['Present', 'Absent', 'Leave'],
      behaviourRatings: [1, 2, 3, 4, 5],
      feeStatus: ['Pending', 'Paid', 'Overdue']
    };

    res.json(successResponse(constants, 'Constants fetched successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
