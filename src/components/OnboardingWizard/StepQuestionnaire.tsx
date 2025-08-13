import { useState, useEffect } from 'react';
import { onboarding } from '../../services/api';

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

export default function StepQuestionnaire() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSubstep, setCurrentSubstep] = useState(1);
    const [answers, setAnswers] = useState<Record<number, Option>>({});
    const [showResults, setShowResults] = useState(false);
    const [scores, setScores] = useState<CategoryScores>({
        urgency_bias: 0,
        importance_bias: 0,
        rigidity: 0
    });

    const questionsPerPage = 2;
    const totalSubsteps = 7;

    useEffect(() => {
        fetchQuestions();
    }, []);

    const OPTION_ORDER = ['A', 'B', 'C', 'D'] as const;
    const sortByOptionCode = (a: Option, b: Option) => {
        const ai = OPTION_ORDER.indexOf(a.option_code as any);
        const bi = OPTION_ORDER.indexOf(b.option_code as any);
        if (ai === -1 || bi === -1) return a.option_code.localeCompare(b.option_code);
        return ai - bi;
    };

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await onboarding.getQuestions();
            const normalized = (Array.isArray(response) ? response : []).map((q: Question) => ({
                ...q,
                options: [...(q.options ?? [])].sort(sortByOptionCode),
            }));
            setQuestions(normalized);
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

        setScores(finalScores);
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Work Style Profile</h3>

                <div className="grid gap-4">
                    {Object.entries(scores).map(([category, score]) => (
                        <div key={category} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-gray-900 capitalize">
                                    {category.replace('_', ' ')}
                                </h4>
                                <span className={`text-2xl font-bold ${score > 0 ? 'text-blue-600' : score < 0 ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                    {score > 0 ? '+' : ''}{score}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${score > 0 ? 'bg-blue-500' : score < 0 ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
                                    style={{ width: `${Math.min(100, Math.abs(score) * 10)}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {category === 'urgency_bias' && (score > 0 ? 'You tend to prioritize urgent tasks' : 'You balance urgency with other factors')}
                                {category === 'importance_bias' && (score > 0 ? 'You focus on important and impactful work' : 'You consider multiple factors beyond importance')}
                                {category === 'rigidity' && (score > 0 ? 'You prefer structured and planned approaches' : 'You have a flexible and adaptive work style')}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                        <strong>What's next?</strong> We'll use this profile to customize your email filters, calendar settings, and notifications to match your work style.
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
                {getCurrentQuestions().map((question, index) => (
                    <div key={question.id} className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">
                            {question.question_text}
                        </h4>
                        <div className="space-y-3">
                            {(question.options ?? []).map((option) => (
                                <label
                                    key={option.id}
                                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${answers[question.id]?.id === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[question.id]?.id === option.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                }`}
                                        >
                                            {answers[question.id]?.id === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span className="ml-3 text-gray-700">
                                            {option.option_code}: {option.option_text}
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

