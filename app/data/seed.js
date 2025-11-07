import { storage } from '../services/storage.js';
import { hashPassword } from '../services/auth.js';
import { uuid } from '../utils/uuid.js';

const META_KEY = 'meta';

export async function ensureSeeded() {
  const meta = storage.get(META_KEY, null);
  if (meta && meta.seededAt) return;

  const adminHash = await hashPassword('admin123');
  const studentHash = await hashPassword('student123');
  const admin = { id: uuid(), role: 'admin', email: 'admin@nexlibra.local', name: 'Admin', passwordHash: adminHash };
  const depts = ['CSE','ECE','IT','MECH','AIML','IOT','EEE','FT','CIVIL','BIOMED'];
  const studentList = [
    // AIML
    ['AIML','AIML001','Dhayalan B'],
    ['AIML','AIML002','Priya Ramesh'],
    ['AIML','AIML003','Aravind Kumar'],
    ['AIML','AIML004','Sneha Kannan'],
    ['AIML','AIML005','Harish Raj'],
    ['AIML','AIML006','Deepika S'],
    ['AIML','AIML007','Sanjay V'],
    ['AIML','AIML008','Meena Krishnan'],
    // CSE
    ['CSE','CSE001','Akash R'],
    ['CSE','CSE002','Divya Rani'],
    ['CSE','CSE003','Gokul Raj'],
    ['CSE','CSE004','Karthika S'],
    ['CSE','CSE005','Nithin Kumar'],
    ['CSE','CSE006','Aishwarya R'],
    ['CSE','CSE007','Suresh M'],
    ['CSE','CSE008','Lavanya P'],
    // ECE
    ['ECE','ECE001','Kishore V'],
    ['ECE','ECE002','Harini S'],
    ['ECE','ECE003','Manoj Kumar'],
    ['ECE','ECE004','Priyadharshini R'],
    ['ECE','ECE005','Abishek N'],
    ['ECE','ECE006','Nivedha K'],
    ['ECE','ECE007','Rohit Raj'],
    ['ECE','ECE008','Janani L'],
    // EEE
    ['EEE','EEE001','Vignesh S'],
    ['EEE','EEE002','Kavya M'],
    ['EEE','EEE003','Dinesh R'],
    ['EEE','EEE004','Pavithra S'],
    ['EEE','EEE005','Balaji K'],
    ['EEE','EEE006','Revathi P'],
    ['EEE','EEE007','Ashwin R'],
    ['EEE','EEE008','Monica B'],
    // IT
    ['IT','IT001','Keerthana S'],
    ['IT','IT002','Rajesh K'],
    ['IT','IT003','Haritha P'],
    ['IT','IT004','Vinoth R'],
    ['IT','IT005','Sandhya N'],
    ['IT','IT006','Pradeep S'],
    ['IT','IT007','Shruthi M'],
    ['IT','IT008','Arjun Kumar'],
    // MECH
    ['MECH','MECH001','Naveen K'],
    ['MECH','MECH002','Prakash R'],
    ['MECH','MECH003','Gopinath S'],
    ['MECH','MECH004','Kiran Raj'],
    ['MECH','MECH005','Bharath V'],
    ['MECH','MECH006','Anand Kumar'],
    ['MECH','MECH007','Saran M'],
    ['MECH','MECH008','Gowtham R'],
    // CIVIL
    ['CIVIL','CIV001','Rajeshwaran S'],
    ['CIVIL','CIV002','Nirmala Devi'],
    ['CIVIL','CIV003','Karthik R'],
    ['CIVIL','CIV004','Sneha R'],
    ['CIVIL','CIV005','Vasanth K'],
    ['CIVIL','CIV006','Priyanka M'],
    ['CIVIL','CIV007','Dhanush P'],
    ['CIVIL','CIV008','Anitha L'],
    // BIOMED
    ['BIOMED','BIO001','Aarthi S'],
    ['BIOMED','BIO002','Varun Raj'],
    ['BIOMED','BIO003','Harshini K'],
    ['BIOMED','BIO004','Manikandan R'],
    ['BIOMED','BIO005','Sangeetha P'],
    ['BIOMED','BIO006','Rohini S'],
    ['BIOMED','BIO007','Vishal R'],
    ['BIOMED','BIO008','Divya Sri T'],
  ];

  const students = studentList.map(([dept, sid, name]) => ({
    id: uuid(), role: 'student', studentId: sid, username: sid.toLowerCase(), email: `${sid.toLowerCase()}@college.edu`, name, dept, passwordHash: studentHash
  }));
  const curated = [
    // AIML
    ['AIML','Artificial Intelligence: A Modern Approach','Stuart Russell & Peter Norvig'],
    ['AIML','Deep Learning','Ian Goodfellow, Yoshua Bengio & Aaron Courville'],
    ['AIML','Hands-On Machine Learning with Scikit-Learn and TensorFlow','Aurélien Géron'],
    ['AIML','Pattern Recognition and Machine Learning','Christopher M. Bishop'],
    ['AIML','Python Machine Learning','Sebastian Raschka'],
    ['AIML','Reinforcement Learning: An Introduction','Richard S. Sutton & Andrew G. Barto'],
    ['AIML','Introduction to Neural Networks','S.N. Sivanandam'],
    ['AIML','Practical Natural Language Processing','Sowmya Vajjala'],
    // CSE
    ['CSE','Introduction to Algorithms (CLRS)','Thomas H. Cormen'],
    ['CSE','Operating System Concepts','Abraham Silberschatz'],
    ['CSE','Computer Networks','Andrew S. Tanenbaum'],
    ['CSE','Database System Concepts','Henry F. Korth'],
    ['CSE','The C Programming Language','Brian W. Kernighan & Dennis M. Ritchie'],
    ['CSE','Data Structures and Algorithms Made Easy','Narasimha Karumanchi'],
    ['CSE','Object-Oriented Programming in C++','Robert Lafore'],
    ['CSE','Head First Java','Kathy Sierra & Bert Bates'],
    // ECE
    ['ECE','Electronic Devices and Circuit Theory','Robert L. Boylestad'],
    ['ECE','Microelectronic Circuits','Sedra & Smith'],
    ['ECE','Signals and Systems','Alan V. Oppenheim'],
    ['ECE','Digital Logic and Computer Design','M. Morris Mano'],
    ['ECE','Communication Systems','Simon Haykin'],
    ['ECE','Control Systems Engineering','Norman S. Nise'],
    ['ECE','Microwave Engineering','David M. Pozar'],
    ['ECE','Linear Integrated Circuits','D. Roy Choudhury'],
    // EEE
    ['EEE','Electrical Machines','P.S. Bimbhra'],
    ['EEE','Power System Analysis','John J. Grainger & William D. Stevenson'],
    ['EEE','Electrical Power Systems','C.L. Wadhwa'],
    ['EEE','Network Analysis','Van Valkenburg'],
    ['EEE','Electric Circuits','James W. Nilsson'],
    ['EEE','Fundamentals of Electrical Engineering','Rajendra Prasad'],
    ['EEE','Power Electronics','M.D. Singh & K.B. Khanchandani'],
    ['EEE','Control Systems: Principles and Design','M. Gopal'],
    // IT
    ['IT','Web Technologies: HTML, CSS, JavaScript','Uttam K. Roy'],
    ['IT','Python Crash Course','Eric Matthes'],
    ['IT','Web Development with Node and Express','Ethan Brown'],
    ['IT','Cloud Computing: Principles and Paradigms','Rajkumar Buyya'],
    ['IT','Data Communication and Networking','Behrouz A. Forouzan'],
    ['IT','Cybersecurity Essentials','Charles J. Brooks'],
    ['IT','Internet of Things (IoT) Fundamentals','David Hanes'],
    ['IT','Software Engineering','Ian Sommerville'],
    // MECH
    ['MECH','Engineering Thermodynamics','P.K. Nag'],
    ['MECH','Theory of Machines','S.S. Rattan'],
    ['MECH','Fluid Mechanics','R.K. Bansal'],
    ['MECH','Strength of Materials','R.S. Khurmi'],
    ['MECH','Manufacturing Processes','P.N. Rao'],
    ['MECH','Machine Design','V.B. Bhandari'],
    ['MECH','Heat and Mass Transfer','J.P. Holman'],
    ['MECH','Engineering Mechanics','Irving H. Shames'],
    // CIVIL
    ['CIVIL','Basic Civil Engineering','S.S. Bhavikatti'],
    ['CIVIL','Surveying','B.C. Punmia'],
    ['CIVIL','Strength of Materials','R.S. Khurmi'],
    ['CIVIL','Concrete Technology','M.L. Gambhir'],
    ['CIVIL','Soil Mechanics and Foundations','B.C. Punmia'],
    ['CIVIL','Fluid Mechanics','R.K. Rajput'],
    ['CIVIL','Transportation Engineering','Khanna & Justo'],
    ['CIVIL','Building Construction','Sushil Kumar'],
    // BIOMED
    ['BIOMED','Introduction to Biomedical Engineering','John Enderle'],
    ['BIOMED','Medical Instrumentation: Application and Design','John G. Webster'],
    ['BIOMED','Biomechanics: Principles and Applications','Donald R. Peterson'],
    ['BIOMED','Tissue Engineering','Bernhard O. Palsson'],
    ['BIOMED','Biomedical Signal Processing','Metin Akay'],
    ['BIOMED','Human Physiology','Dee Unglaub Silverthorn'],
    ['BIOMED','Introduction to Biomechatronics','Koji Ikuta'],
    ['BIOMED','Neural Engineering','Bin He']
  ];

  const books = curated.map(([dept, title, author], i) => ({
    id: uuid(), title, author, dept, price: 500 + (i % 6) * 50, totalCopies: 5, availableCopies: 5, status: 'active'
  }));

  storage.set('users', [admin, ...students]);
  storage.set('books', books);
  storage.set('transactions', []);
  storage.set('audit', []);
  storage.set(META_KEY, { version: 1, seededAt: Date.now() });
}

export async function resetSeed() {
  // Clear all NexLibra data and reseed
  storage.clearAll();
  await ensureSeeded();
}


