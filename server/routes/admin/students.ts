import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import cors from 'cors';
import { supabase } from '../../db/supabase';
import { isAdmin, verifyToken } from '../../middleware/auth';

const router = Router();
router.use(cors());
router.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/students', verifyToken, isAdmin, async (req: Request, res: Response): Promise<any> => {
    const { first_name, last_name, email } = req.body;
    if (!first_name || !last_name || !email) {
        return res.status(400).json({ message: 'ALL FIELDS ARE REQUIRED!' });
    }

    try {
        const { data, error } = await supabase
            .from('students')
            .insert([{ first_name, last_name, email }]);

        if (error) throw error;
        return res.status(201).json({ message: 'REGISTRATION SUCCESSFUL!', student: data });
    } catch (error) {
        console.error('ERROR CREATING STUDENT:', error);
        return res.status(500).json({ message: 'INTERNAL SERVER ERROR!' });
    }
});

router.post('/students/bulk', verifyToken, isAdmin, upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = xlsx.utils.sheet_to_json(sheet);

        const students = json.map((row: any) => ({
            first_name: (row.first_name || row["first name"] || row["First Name"] || "").trim(),
            last_name: (row.last_name || row["last name"] || row["Last Name"] || "").trim(),
            email: (row.email || row["email address"] || row["Email"] || "").trim(),
        }));

        if (!students.every((s) => s.first_name && s.last_name && s.email)) {
            return res.status(400).json({ message: 'One or more entries are missing required fields' });
        }

        const { data, error } = await supabase.from('students').insert(students);
        if (error) throw error;

        return res.status(201).json({ message: 'Bulk upload successful', students: data });
    } catch (error) {
        console.error('Error parsing file or inserting data:', error);
        return res.status(500).json({ message: 'Bulk upload failed' });
    }
});


router.get('/students', verifyToken, isAdmin, async (_req, res) => {
    try {
        const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Failed to fetch students' });
    }
});


router.delete('/students/:id', verifyToken, isAdmin, async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Student ID is required' });

    try {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
