import { useState, useEffect } from 'react';
import { onboarding } from '../../services/api';
import { StepProps } from '../../pages/OnboardingPage';

interface Option {
    id: number;
    option_code: string;
    option_text: string;
    tag_id: number;
    category_id: number;
    score: number;
    category: string;
    tag: string;
}

interface Question {
    id: number;
    question_text: string;
    created_at: string;
    updated_at: string;
    is_active: number;
    is_deleted: number;
    options: Option[];
}

interface CategoryScores {
    urgency_bias: number;
    importance_bias: number;
    rigidity: number;
}

export default function StepQuestionnaire({ updateData, onStepComplete }: StepProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSubstep, setCurrentSubstep] = useState(1);
    const [answers, setAnswers] = useState<Record<number, Option>>({});
    const [showResults, setShowResults] = useState(false);

    const questionsPerPage = 2;
    const totalSubsteps = 7;

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await onboarding.getQuestions();
            setQuestions(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentQuestions = () => {
        const startIndex = (currentSubstep - 1) * questionsPerPage;
        const endIndex = startIndex + questionsPerPage;
        return questions.slice(startIndex, endIndex);
    };

    const handleAnswerSelect = (questionId: number, option: Option) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleNext = () => {
        if (currentSubstep < totalSubsteps) {
            setCurrentSubstep(prev => prev + 1);
        } else {
            calculateFinalScores();
            setShowResults(true);
        }
    };

    const handlePrevious = () => {
        if (showResults) {
            setShowResults(false);
        } else if (currentSubstep > 1) {
            setCurrentSubstep(prev => prev - 1);
        }
    };

    const calculateFinalScores = () => {
        const finalScores: CategoryScores = {
            urgency_bias: 0,
            importance_bias: 0,
            rigidity: 0
        };

        Object.values(answers).forEach(option => {
            if (option.category in finalScores) {
                finalScores[option.category as keyof CategoryScores] += option.score;
            }
        });

        // Create questionnaire array with complete question and answer data
        const questionnaireData = questions.map(question => {
            const answer = answers[question.id];
            if (answer) {
                return {
                    id: question.id,
                    question_text: question.question_text,
                    created_at: question.created_at,
                    updated_at: question.updated_at,
                    is_active: question.is_active,
                    is_deleted: question.is_deleted,
                    answer: {
                        id: answer.id,
                        option_code: answer.option_code,
                        option_text: answer.option_text,
                        tag_id: answer.tag_id,
                        category_id: answer.category_id,
                        score: answer.score,
                        category: answer.category,
                        tag: answer.tag
                    }
                };
            }
            return null;
        }).filter(Boolean) as any[];

        // Update the onboarding data with questionnaire responses and scores
        updateData({
            questionnaire: questionnaireData,
            score: finalScores
        });

        // Mark step as complete when showing results
        onStepComplete(true);
    };

    const isCurrentPageComplete = () => {
        const currentQuestions = getCurrentQuestions();
        return currentQuestions.every(q => answers[q.id]);
    };

    const progress = showResults ? 100 : (currentSubstep / totalSubsteps) * 100;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="space-y-6">
                <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank you for filling the questionnaire!</h3>
                    <p className="text-lg text-gray-600 mb-6">
                        Your responses will help us customize your experience.
                    </p>
                    <p className="text-base text-gray-500">
                        Please move ahead with the onboarding process.
                    </p>
                </div>

                <div className="flex justify-between pt-4">
                    <button
                        onClick={handlePrevious}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Back to Questions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Questions {(currentSubstep - 1) * questionsPerPage + 1}-
                        {Math.min(currentSubstep * questionsPerPage, questions?.length ?? 0)} of {questions?.length ?? 0}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                        {Math.round(progress)}% Complete
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
                {getCurrentQuestions().map((question) => (
                    <div key={question.id} className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">
                            {question.question_text}
                        </h4>
                        <div className="space-y-3">
                            {(question.options ?? [])
                                .sort((a, b) => {
                                    // Sort options by option_code to ensure consistent ordering
                                    if (a.option_code && b.option_code) {
                                        return a.option_code.localeCompare(b.option_code);
                                    }
                                    // Fallback to id if option_code is not available
                                    return a.id - b.id;
                                })
                                .map((option) => (
                                <label
                                    key={option.id}
                                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${answers[question.id]?.id === option.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={option.id}
                                        checked={answers[question.id]?.id === option.id}
                                        onChange={() => handleAnswerSelect(question.id, option)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[question.id]?.id === option.id
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {answers[question.id]?.id === option.id && (
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            )}
                                        </div>
                                        <span className="ml-3 text-gray-700">
                                            {option.option_code} : {option.option_text}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
                <button
                    onClick={handlePrevious}
                    disabled={currentSubstep === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                <span className="text-sm text-gray-500 flex items-center">
                    Page {currentSubstep} of {totalSubsteps}
                </span>

                <button
                    onClick={handleNext}
                    disabled={!isCurrentPageComplete()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {currentSubstep === totalSubsteps ? 'View Results' : 'Next'}
                </button>
            </div>
        </div>
    );
}