import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CourseNavbar from '../courseNavbar';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { FaTrophy, FaThumbsUp, FaSmile, FaBook, FaSadTear, FaRegSadTear } from 'react-icons/fa';
import placeholderimg from "../../assets/Dashboard/placeholder_teki.png";
import wordProcessorImg from "../../assets/QuizImages/CB_unit1_wordprocessor.png";
import laptopImg from "../../assets/QuizImages/CB_unit1_laptop.png";
import tabletImg from "../../assets/QuizImages/CB_unit1_tablet.png";
import cpuImg from "../../assets/QuizImages/CB_unit1_cpu.png";
import keyboardImg from "../../assets/QuizImages/CB_unit1_keyboard.png";
import mouseImg from "../../assets/QuizImages/CB_unit1_mouse.png";
import speakersImg from "../../assets/QuizImages/CB_unit1_speaker.png";
import powerButtonImg from "../../assets/QuizImages/CB_unit1_powerbutton.png";
import spillImg from "../../assets/QuizImages/CB_unit1_spill.png";
import './LessonPage.css';

const LessonPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Set initial lesson based on state parameter
  useEffect(() => {
    const { lessonNumber, showQuiz: showQuizParam } = location.state || {};
    if (lessonNumber) {
      setCurrentLesson(lessonNumber);
      setShowQuiz(showQuizParam || false);
      setCurrentSlide(0);
    }
  }, [location.state]);

  const unitContent = {
    number: 1,
    title: "Introduction to Computers",
    lessons: [
      { number: 1, title: "What is a Computer" },
      { number: 2, title: "Types of Computers" },
      { number: 3, title: "Computer Parts Overview" },
      { number: 4, title: "Peripherals and Their Uses" },
      { number: 5, title: "How to Turn a Computer On and Off Properly" },
      { number: 6, title: "Basic Safety & Handling Tips" },
      { type: "quiz", number: 1, title: "Introduction to Computers" }
    ]
  };

  // lesson content with slides
  const lessonContents = {
    1: {
      title: "What is a Computer?",
      totalSlides: 3,
      slides: [
        {
          content: "A computer is an electronic device that manipulates information, or data. It has the ability to store, retrieve, and process data.",
          hasImage: true
        },
        {
          content: "You may already know that you can use a computer to type documents, send email, play games, and browse the Web. You can also use it to edit or create spreadsheets, presentations, and even videos.",
          hasImage: true
        },
        {
          content: "A computer consists of two things: Hardware and Software",
          hasImage: true,
          subContent: [
            {
              title: "Hardware",
              description: "is any part of your computer that has a physical structure, such as the keyboard or mouse. It includes anything you can physically touch and see in the image below."
            },
            {
              title: "Software",
              description: "is any set of instructions that tells the hardware what to do and how to do it. Examples of software include web browsers, games, and word processors."
            }
          ]
        }
      ]
    },
    2: {
      title: "Types of Computers",
      totalSlides: 2,
      slides: [
        {
          content: "There are many different types of computers designed for different purposes. The four main categories of computers are: Desktop Computers, Laptop Computers, Tablets, and Smartphones.",
          hasImage: true
        },
        {
          content: "Each type of computer has its own unique features and capabilities, making them suitable for different tasks and users.",
          hasImage: true,
          subContent: [
            {
              title: "Desktop Computers",
              description: "Powerful computers that stay in one place, ideal for work and gaming."
            },
            {
              title: "Laptop Computers",
              description: "Portable computers that offer a good balance of power and mobility."
            }
          ]
        }
      ]
    },
    3: {
      title: "Computer Parts Overview",
      totalSlides: 5,
      slides: [
        {
          content: "The monitor is one of the most important parts of your computer. It displays all the information you need to see, from text and images to videos and games. Modern monitors come in different sizes and resolutions, offering clear and vibrant displays.",
          hasImage: true,
          subContent: [
            {
              title: "Key Features",
              description: "Resolution, size, refresh rate, and display technology (LCD, LED, OLED) affect how content appears on your screen."
            },
            {
              title: "Care Tips",
              description: "Keep your monitor clean and avoid touching the screen. Adjust brightness and contrast for comfortable viewing."
            }
          ]
        },
        {
          content: "The CPU (Central Processing Unit) is often called the brain of the computer. It processes all the instructions and calculations that make your computer work. The faster your CPU, the quicker your computer can perform tasks.",
          hasImage: true,
          subContent: [
            {
              title: "How It Works",
              description: "The CPU receives instructions from software and hardware, processes them, and sends the results to other components."
            },
            {
              title: "Performance Factors",
              description: "Clock speed, number of cores, and cache size determine how well your CPU performs different tasks."
            }
          ]
        },
        {
          content: "The mouse is your primary pointing device. It allows you to move the cursor on the screen and interact with different elements. Modern mice come with additional features like scroll wheels and programmable buttons.",
          hasImage: true,
          subContent: [
            {
              title: "Types of Mice",
              description: "Wired mice connect via USB, while wireless mice use Bluetooth or a USB receiver. Gaming mice often have extra buttons and higher precision."
            },
            {
              title: "Proper Usage",
              description: "Keep your mouse on a clean, flat surface. Regular cleaning prevents tracking issues and extends its lifespan."
            }
          ]
        },
        {
          content: "The keyboard is your main input device for typing and using shortcuts. It has keys for letters, numbers, and special functions. Different keyboard layouts and types are available for various needs.",
          hasImage: true,
          subContent: [
            {
              title: "Keyboard Types",
              description: "Mechanical keyboards offer better tactile feedback, while membrane keyboards are quieter. Ergonomic keyboards help prevent strain."
            },
            {
              title: "Shortcut Keys",
              description: "Learn common shortcuts like Ctrl+C (copy), Ctrl+V (paste), and Alt+Tab (switch windows) to work more efficiently."
            }
          ]
        },
        {
          content: "Additional peripherals enhance your computer experience. Speakers provide audio output, webcams enable video communication, and printers create physical copies of digital documents.",
          hasImage: true,
          subContent: [
            {
              title: "Audio Devices",
              description: "Speakers and headphones come in various types, from basic stereo to surround sound systems for immersive experiences."
            },
            {
              title: "Video Devices",
              description: "Webcams and microphones are essential for video calls and content creation. Choose devices with good resolution and audio quality."
            }
          ]
        }
      ]
    },
    4: {
      title: "Peripherals and Their Uses",
      totalSlides: 3,
      slides: [
        {
          content: "Input devices are essential for interacting with your computer. The mouse and keyboard are the most common, but scanners, webcams, and microphones also serve important input functions.",
          hasImage: true,
          subContent: [
            {
              title: "Mouse and Keyboard",
              description: "Primary input devices for navigation and text entry. Choose ergonomic designs for comfort during long use."
            },
            {
              title: "Specialized Input",
              description: "Scanners digitize documents, webcams capture video, and microphones record audio. Each serves specific input needs."
            }
          ]
        },
        {
          content: "Output devices display or produce information from your computer. Monitors show visual content, printers create physical copies, and speakers produce sound.",
          hasImage: true,
          subContent: [
            {
              title: "Visual Output",
              description: "Monitors and projectors display information. Choose based on size, resolution, and color accuracy needs."
            },
            {
              title: "Audio Output",
              description: "Speakers and headphones produce sound. Consider sound quality, volume, and comfort when selecting."
            }
          ]
        },
        {
          content: "Understanding peripherals is crucial for effective computer use. They bridge the gap between you and your computer, enabling interaction and functionality.",
          hasImage: true,
          subContent: [
            {
              title: "Enhanced Productivity",
              description: "The right peripherals can significantly improve your work efficiency and comfort."
            },
            {
              title: "Customization",
              description: "Choose peripherals that match your needs and preferences for the best computing experience."
            }
          ]
        }
      ]
    },
    5: {
      title: "How to Turn a Computer On and Off Properly",
      totalSlides: 3,
      slides: [
        {
          content: "Turning on your computer properly ensures a smooth start. Locate the power button, usually on the front or top of the case, and press it once. Wait for the boot process to complete before using the computer.",
          hasImage: true,
          subContent: [
            {
              title: "Power Button Location",
              description: "The power button is typically marked with a power symbol. On laptops, it's often near the keyboard or on the side."
            },
            {
              title: "Boot Process",
              description: "During startup, the computer checks hardware, loads the operating system, and prepares for use. Wait until this process completes."
            }
          ]
        },
        {
          content: "Proper shutdown is crucial for maintaining your computer's health. Use the Start menu and select 'Shut down' to safely close all programs and turn off the computer.",
          hasImage: true,
          subContent: [
            {
              title: "Shutdown Steps",
              description: "1. Save all work\n2. Close all programs\n3. Click Start\n4. Select Shut down\n5. Wait for the computer to turn off completely"
            },
            {
              title: "Alternative Methods",
              description: "If the computer is unresponsive, hold the power button for 5-10 seconds. Use this only as a last resort."
            }
          ]
        },
        {
          content: "Proper shutdown procedures prevent data loss and hardware damage. Abrupt power loss can corrupt files and harm your computer's components.",
          hasImage: true,
          subContent: [
            {
              title: "Data Protection",
              description: "Proper shutdown ensures all files are saved and programs close correctly, preventing data corruption."
            },
            {
              title: "Hardware Longevity",
              description: "Following proper shutdown procedures extends the life of your computer's components and prevents damage."
            }
          ]
        }
      ]
    },
    6: {
      title: "Basic Safety & Handling Tips",
      totalSlides: 2,
      slides: [
        {
          content: "Proper computer care starts with good habits. Keep your hands clean, maintain a dry environment, and always shut down your computer properly. These practices help prevent damage and ensure longevity.",
          hasImage: true,
          subContent: [
            {
              title: "Clean Environment",
              description: "Keep your computer in a clean, dust-free area. Regular cleaning prevents overheating and component damage."
            },
            {
              title: "Proper Shutdown",
              description: "Always use the proper shutdown procedure instead of unplugging or forcing the computer off."
            }
          ]
        },
        {
          content: "Avoid common mistakes that can damage your computer. Never unplug devices while they're in use, keep food and drinks away from your keyboard, and protect your computer from power surges.",
          hasImage: true,
          subContent: [
            {
              title: "Power Safety",
              description: "Use surge protectors and avoid unplugging devices while they're active. This prevents data loss and hardware damage."
            },
            {
              title: "Physical Care",
              description: "Keep food and drinks away from your computer. Clean spills immediately and avoid touching components with dirty hands."
            }
          ]
        }
      ]
    }
  };

  // Add quiz content
  const quizContent = {
    1: {
      title: "Quiz 1",
      subtitle: "Introduction to Computers",
      description: "It is time for a Quiz",
      instructions: "Get Ready to answer 20 questions",
      duration: "5-10 minutes"
    }
  };

  const quizQuestions = [
    // Lesson 1 Questions (4)
    {
      id: 1,
      lesson: 1,
      text: "What is a Computer?",
      hasImage: false,
      choices: [
        "An electronic device that manipulates information and data",
        "A mechanical calculator",
        "A type of television",
        "A communication device only"
      ],
      correctAnswer: 0
    },
    {
      id: 2,
      lesson: 1,
      text: "Which of the following is NOT a basic function of a computer?",
      hasImage: false,
      choices: [
        "Processing data",
        "Storing information",
        "Cooking food",
        "Retrieving data"
      ],
      correctAnswer: 2
    },
    {
      id: 3,
      lesson: 1,
      text: "What are the two main components of a computer system?",
      hasImage: false,
      choices: [
        "Monitor and Keyboard",
        "Hardware and Software",
        "CPU and Memory",
        "Input and Output devices"
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      lesson: 1,
      text: "Identify the software shown in the image:",
      hasImage: true,
      imagePath: wordProcessorImg,
      choices: [
        "Web Browser",
        "Word Processor",
        "Video Game",
        "Operating System"
      ],
      correctAnswer: 1
    },
    // Lesson 2 Questions (3)
    {
      id: 5,
      lesson: 2,
      text: "Which type of computer is shown in the image?",
      hasImage: true,
      imagePath: laptopImg,
      choices: [
        "Desktop Computer",
        "Laptop Computer",
        "Tablet",
        "Smartphone"
      ],
      correctAnswer: 1
    },
    {
      id: 6,
      lesson: 2,
      text: "Which type of computer is most suitable for portability and daily commute?",
      hasImage: false,
      choices: [
        "Desktop Computer",
        "Server Computer",
        "Laptop Computer",
        "Mainframe Computer"
      ],
      correctAnswer: 2
    },
    {
      id: 7,
      lesson: 2,
      text: "Identify this modern computing device:",
      hasImage: true,
      imagePath: tabletImg,
      choices: [
        "Smartphone",
        "E-reader",
        "Tablet",
        "Laptop"
      ],
      correctAnswer: 2
    },
    // Lesson 3 Questions (4)
    {
      id: 8,
      lesson: 3,
      text: "What computer part is shown in the image?",
      hasImage: true,
      imagePath: cpuImg,
      choices: [
        "GPU",
        "CPU",
        "RAM",
        "Power Supply"
      ],
      correctAnswer: 1
    },
    {
      id: 9,
      lesson: 3,
      text: "Which component is often called the 'brain' of the computer?",
      hasImage: false,
      choices: [
        "Monitor",
        "Keyboard",
        "CPU",
        "Mouse"
      ],
      correctAnswer: 2
    },
    {
      id: 10,
      lesson: 3,
      text: "Identify this input device:",
      hasImage: true,
      imagePath: keyboardImg,
      choices: [
        "Mouse",
        "Keyboard",
        "Scanner",
        "Printer"
      ],
      correctAnswer: 1
    },
    {
      id: 11,
      lesson: 3,
      text: "What is the main function of RAM in a computer?",
      hasImage: false,
      choices: [
        "Permanent storage",
        "Processing calculations",
        "Temporary memory",
        "Display output"
      ],
      correctAnswer: 2
    },
    // Lesson 4 Questions (3)
    {
      id: 12,
      lesson: 4,
      text: "Which of these is an input device?",
      hasImage: true,
      imagePath: mouseImg,
      choices: [
        "Monitor",
        "Printer",
        "Mouse",
        "Speakers"
      ],
      correctAnswer: 2
    },
    {
      id: 13,
      lesson: 4,
      text: "What type of device is a printer?",
      hasImage: false,
      choices: [
        "Input device",
        "Output device",
        "Processing device",
        "Storage device"
      ],
      correctAnswer: 1
    },
    {
      id: 14,
      lesson: 4,
      text: "Identify this output device:",
      hasImage: true,
      imagePath: speakersImg,
      choices: [
        "Microphone",
        "Speakers",
        "Webcam",
        "Scanner"
      ],
      correctAnswer: 1
    },
    // Lesson 5 Questions (3)
    {
      id: 15,
      lesson: 5,
      text: "What is the correct first step when turning on a computer?",
      hasImage: false,
      choices: [
        "Open programs immediately",
        "Press the power button once",
        "Hold the power button down",
        "Unplug and replug"
      ],
      correctAnswer: 1
    },
    {
      id: 16,
      lesson: 5,
      text: "Identify the power button symbol shown:",
      hasImage: true,
      imagePath: powerButtonImg,
      choices: [
        "Restart symbol",
        "Power symbol",
        "Sleep symbol",
        "Shutdown symbol"
      ],
      correctAnswer: 1
    },
    {
      id: 17,
      lesson: 5,
      text: "What is the proper way to shut down a computer?",
      hasImage: false,
      choices: [
        "Pull the power plug",
        "Hold the power button",
        "Use the Start menu shutdown option",
        "Close the monitor"
      ],
      correctAnswer: 2
    },
    // Lesson 6 Questions (3)
    {
      id: 18,
      lesson: 6,
      text: "Which of these is a proper safety practice?",
      hasImage: false,
      choices: [
        "Eating over the keyboard",
        "Using a surge protector",
        "Unplugging while running",
        "Touching components with wet hands"
      ],
      correctAnswer: 1
    },
    {
      id: 19,
      lesson: 6,
      text: "What should you NOT do with your computer?",
      hasImage: true,
      imagePath: spillImg,
      choices: [
        "Use a surge protector",
        "Clean regularly",
        "Keep drinks near it",
        "Update software"
      ],
      correctAnswer: 2
    },
    {
      id: 20,
      lesson: 6,
      text: "How often should you clean your computer?",
      hasImage: false,
      choices: [
        "Never",
        "Only when broken",
        "Regularly",
        "Once a year"
      ],
      correctAnswer: 2
    }
  ];

  const handleNextSlide = () => {
    if (currentSlide < lessonContents[currentLesson].totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNextLesson = () => {
    if (currentLesson < 6) {
      const nextLesson = currentLesson + 1;
      navigate('/courses/ComputerBasics/lesson', {
        state: { lessonNumber: nextLesson }
      });
    } else {
      // If it's the last lesson, show the quiz
      navigate('/courses/ComputerBasics/lesson', {
        state: { lessonNumber: 6, showQuiz: true }
      });
    }
  };

  const isLastSlide = currentSlide === lessonContents[currentLesson].totalSlides - 1;
  const currentLessonContent = lessonContents[currentLesson];

  const handleQuizStart = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const confirmSubmit = () => {
    setShowConfirmation(false);
    // Calculate score based on selected answers
    const totalQuestions = quizQuestions.length;
    const correctAnswers = quizQuestions.reduce((count, question) => {
      return selectedAnswers[question.id] === question.correctAnswer ? count + 1 : count;
    }, 0);
    setScore(correctAnswers); // Store the raw score
    setShowScore(true);
  };

  const handleReviewAnswers = () => {
    setShowScore(false);
    setShowReview(true);
  };

  const handleContinue = () => {
    navigate('/courses/ComputerBasics');
  };

  const getScoreMessage = (score) => {
    const total = quizQuestions.length;
    const scoreValue = Math.round((score / total) * 100);
    
    if (scoreValue === 100) {
      return {
        icon: <FaTrophy className="icon" style={{ color: '#FFD700' }} />,
        title: "Perfect Score!",
        message: `You got ${score}/${total}. Great job on learning and completing UNIT 1: Introduction to Computers! Keep up the excellent work!`
      };
    } else if (scoreValue >= 85) {
      return {
        icon: <FaThumbsUp className="icon" style={{ color: '#4CAF50' }} />,
        title: "Almost Perfect!",
        message: `You scored ${score}/${total}. You're doing really well! A quick review of a few topics and you'll be a master!`
      };
    } else if (scoreValue >= 65) {
      return {
        icon: <FaSmile className="icon" style={{ color: '#2196F3' }} />,
        title: "Good Job!",
        message: `You got ${score}/${total}. You're on the right track! Consider revisiting a few lessons for better understanding.`
      };
    } else if (scoreValue >= 45) {
      return {
        icon: <FaBook className="icon" style={{ color: '#FF9800' }} />,
        title: "Keep Going!",
        message: `You scored ${score}/${total}. You're learning steadily! Try reviewing the lessons again and retake the quiz when you're ready.`
      };
    } else if (scoreValue >= 25) {
      return {
        icon: <FaSadTear className="icon" style={{ color: '#F44336' }} />,
        title: "Needs Improvement",
        message: `You got ${score}/${total}. That's okay! Let's go back and review the lessons to strengthen your understanding.`
      };
    } else {
      return {
        icon: <FaRegSadTear className="icon" style={{ color: '#D32F2F' }} />,
        title: "Start from the Basics",
        message: `You scored ${score}/${total}. Don't worry — learning takes time! Go back to the lessons and take it one step at a time.`
      };
    }
  };

  const handleLessonChange = (lesson) => {
    if (lesson.type === "quiz") {
      navigate('/courses/ComputerBasics/lesson', {
        state: { lessonNumber: 6, showQuiz: true }
      });
    } else {
      navigate('/courses/ComputerBasics/lesson', {
        state: { lessonNumber: lesson.number }
      });
    }
  };

  const renderConfirmationModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Submit Answer</h2>
        <p className="modal-message">Are you sure with your answer and continue to submit?</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={() => setShowConfirmation(false)}>
            Cancel
          </button>
          <button className="modal-button confirm" onClick={confirmSubmit}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const renderScoreDisplay = () => {
    const scoreData = getScoreMessage(score);
    return (
      <div className="modal-overlay">
        <div className="score-display modal-content">
          <div className="score-header">
            {scoreData.icon}
            <h2 className="score-title">{scoreData.title}</h2>
          </div>
          <p className="score-message">{scoreData.message}</p>
          <div className="modal-buttons">
            <button className="modal-button review" onClick={handleReviewAnswers}>
              Review Results
            </button>
            <button className="modal-button continue" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewAnswers = () => (
    <div className="modal-overlay">
      <div className="review-container modal-content">
        <h2 className="review-title">Quiz Review</h2>
        {quizQuestions.map((question) => {
          const isCorrect = selectedAnswers[question.id] === question.correctAnswer;
          return (
            <div key={question.id} className="review-question">
              <div className="question-text">
                Q{question.id}. {question.text}
              </div>
              {question.hasImage && (
                <div className="question-image-container">
                  <img 
                    src={question.imagePath} 
                    alt={`Question ${question.id}`} 
                    className="question-image"
                  />
                </div>
              )}
              <div className={`review-answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                <p><strong>Your answer:</strong> {question.choices[selectedAnswers[question.id]]}</p>
                <p><strong>Correct answer:</strong> {question.choices[question.correctAnswer]}</p>
                <div className="explanation">
                  <strong>Explanation:</strong> This is the correct answer because...
                  {/* Add explanations for each question */}
                </div>
              </div>
            </div>
          );
        })}
        <div className="modal-buttons">
          <button className="modal-button continue" onClick={handleContinue}>
            Back to Lessons
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuizContent = () => {
    if (showScore) {
      return renderScoreDisplay();
    }

    if (showReview) {
      return renderReviewAnswers();
    }

    if (!quizStarted) {
      const quiz = quizContent[1];
      return (
        <div className="quiz-content">
          <h1 className="quiz-title">{quiz.title}:</h1>
          <h2 className="quiz-subtitle">{quiz.subtitle}</h2>
          <div className="quiz-box">
            <h2>{quiz.description}</h2>
            <p>{quiz.instructions}</p>
            <p>{quiz.duration}</p>
          </div>
          <button className="start-button" onClick={handleQuizStart}>
            Start
          </button>
        </div>
      );
    }

    return (
      <div className="quiz-questions-container">
        <div className="quiz-questions-header">
          <h1>Quiz 1:</h1>
          <h2>Introduction to Computers</h2>
        </div>
        {quizQuestions.map((question) => (
          <div key={question.id} className="quiz-question">
            <div className="question-text">
              Q{question.id}. {question.text}
            </div>
            {question.hasImage && (
              <div className="question-image-container">
                <img 
                  src={question.imagePath} 
                  alt={`Question ${question.id}`} 
                  className="question-image"
                />
              </div>
            )}
            <div className="choices-grid">
              {question.choices.map((choice, index) => (
                <button
                  key={index}
                  className={`choice-button ${selectedAnswers[question.id] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(question.id, index)}
                >
                  {['A', 'B', 'C', 'D'][index]}. {choice}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="submit-container">
          <button
            className="submit-button"
            disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (showQuiz) {
      return renderQuizContent();
    }

    return (
      <>
        <div className="lesson-header">
          <h1>LESSON {currentLesson}: {currentLessonContent.title}</h1>
        </div>
        
        <div className="slide-content">
          {currentLessonContent.slides[currentSlide].hasImage && (
            <div className="image-placeholder"></div>
          )}
          
          <p className="main-text">{currentLessonContent.slides[currentSlide].content}</p>
          
          {currentLessonContent.slides[currentSlide].subContent && (
            <div className="sub-content">
              {currentLessonContent.slides[currentSlide].subContent.map((item, index) => (
                <div key={index} className="sub-content-item">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navigation-controls">
          <button 
            className="nav-button prev"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
          >
            <FaChevronLeft />
          </button>
          <button 
            className={`nav-button next ${isLastSlide ? 'next-lesson' : ''}`}
            onClick={isLastSlide ? handleNextLesson : handleNextSlide}
            disabled={isLastSlide && currentLesson === unitContent.lessons.length}
          >
            {isLastSlide ? 'Next Lesson' : <FaChevronRight />}
          </button>
        </div>
        <div className="slide-indicator">
          {currentSlide + 1} / {currentLessonContent.totalSlides}
        </div>
      </>
    );
  };

  return (
    <div className="lesson-page">
      <CourseNavbar courseTitle="Computer Basics" />
      <div className="content-wrapper">
        <div className="lesson-sidebar">
          <div className="course-header">
            <div className="course-icon">
              <img src={placeholderimg} alt="Course Icon" />
            </div>
            <h2>Computer Basics</h2>
          </div>
          <div className="lesson-nav">
            <div className="unit-header">
              <div className="unit-title">
                <span>UNIT {unitContent.number}:</span>
                <span>{unitContent.title}</span>
                <FaChevronRight className="chevron-icon" />
              </div>
            </div>
            {unitContent.lessons.map((lesson, index) => (
              <div 
                key={index} 
                className={`lesson-nav-item ${
                  lesson.type === "quiz" 
                    ? "quiz-item" 
                    : lesson.number === currentLesson && !showQuiz 
                      ? "active" 
                      : ""
                }`}
                onClick={() => handleLessonChange(lesson)}
              >
                <div className="lesson-nav-title">
                  <div>
                    <span className="lesson-label">
                      {lesson.type === "quiz" ? "QUIZ" : "LESSON"} {lesson.number}:
                    </span>
                    <span className="lesson-name">{lesson.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lesson-content">
          {renderContent()}
        </div>
      </div>
      {showConfirmation && renderConfirmationModal()}
    </div>
  );
};

export default LessonPage;

