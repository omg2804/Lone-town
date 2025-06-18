import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Users, Target, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { saveCompatibilityData } = useUser();

  const [formData, setFormData] = useState({
    values: [] as string[],
    emotionalIntelligence: 5,
    relationshipGoals: '',
    lifestyle: [] as string[],
    personalityTraits: {
      openness: 5,
      conscientiousness: 5,
      extraversion: 5,
      agreeableness: 5,
      neuroticism: 5
    },
    dealBreakers: [] as string[],
    interests: [] as string[]
  });

  const steps = [
    {
      title: "Your Core Values",
      icon: Heart,
      description: "What matters most to you in life?",
      component: ValuesStep
    },
    {
      title: "Emotional Intelligence",
      icon: Users,
      description: "How do you handle emotions and relationships?",
      component: EmotionalStep
    },
    {
      title: "Relationship Goals",
      icon: Target,
      description: "What are you looking for in a relationship?",
      component: GoalsStep
    },
    {
      title: "Lifestyle & Interests",
      icon: Sparkles,
      description: "Tell us about your lifestyle and hobbies",
      component: LifestyleStep
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await saveCompatibilityData(formData);
      updateUser({ isOnboarded: true });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-pink-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Lone Town
            </h1>
          </div>
          
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    index < currentStep ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 container mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600 text-lg">
                {steps[currentStep].description}
              </p>
            </div>

            <CurrentStepComponent 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="container mx-auto max-w-4xl mt-8">
        <div className="flex justify-between">
          <motion.button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span>{currentStep === steps.length - 1 ? (loading ? 'Completing...' : 'Complete') : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Step Components
function ValuesStep({ formData, updateFormData }: any) {
  const values = [
    'Family', 'Career', 'Adventure', 'Stability', 'Creativity', 'Health',
    'Spirituality', 'Education', 'Community', 'Independence', 'Tradition', 'Innovation'
  ];

  const toggleValue = (value: string) => {
    const newValues = formData.values.includes(value)
      ? formData.values.filter((v: string) => v !== value)
      : [...formData.values, value];
    updateFormData({ values: newValues });
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-gray-600 mb-6">
        Select the values that are most important to you (choose 3-6):
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {values.map((value) => (
          <motion.button
            key={value}
            onClick={() => toggleValue(value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-xl border-2 text-center font-medium transition-all duration-200 ${
              formData.values.includes(value)
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 hover:border-pink-300 text-gray-700'
            }`}
          >
            {value}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function EmotionalStep({ formData, updateFormData }: any) {
  const traits = [
    { key: 'openness', label: 'Openness to Experience', description: 'How open are you to new experiences?' },
    { key: 'conscientiousness', label: 'Conscientiousness', description: 'How organized and disciplined are you?' },
    { key: 'extraversion', label: 'Extraversion', description: 'How outgoing and social are you?' },
    { key: 'agreeableness', label: 'Agreeableness', description: 'How cooperative and trusting are you?' },
    { key: 'neuroticism', label: 'Emotional Stability', description: 'How well do you handle stress?' }
  ];

  const updateTrait = (trait: string, value: number) => {
    updateFormData({
      personalityTraits: {
        ...formData.personalityTraits,
        [trait]: value
      }
    });
  };

  return (
    <div className="space-y-8">
      <p className="text-center text-gray-600 mb-6">
        Rate yourself on these personality dimensions (1 = Low, 10 = High):
      </p>
      
      {traits.map((trait) => (
        <div key={trait.key} className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-800">{trait.label}</h3>
            <p className="text-sm text-gray-600">{trait.description}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 w-8">Low</span>
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.personalityTraits[trait.key]}
                onChange={(e) => updateTrait(trait.key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <span className="text-sm text-gray-500 w-8">High</span>
            <span className="text-lg font-semibold text-purple-600 w-8">
              {formData.personalityTraits[trait.key]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function GoalsStep({ formData, updateFormData }: any) {
  const goals = [
    'Looking for a serious long-term relationship',
    'Open to dating and seeing where it goes',
    'Interested in marriage and starting a family',
    'Focusing on personal growth and companionship',
    'Want to travel and explore life with someone',
    'Seeking a deep emotional and intellectual connection'
  ];

  return (
    <div className="space-y-6">
      <p className="text-center text-gray-600 mb-6">
        What best describes what you're looking for?
      </p>
      
      <div className="space-y-4">
        {goals.map((goal) => (
          <motion.button
            key={goal}
            onClick={() => updateFormData({ relationshipGoals: goal })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
              formData.relationshipGoals === goal
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 hover:border-pink-300 text-gray-700'
            }`}
          >
            {goal}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function LifestyleStep({ formData, updateFormData }: any) {
  const lifestyleOptions = [
    'Active/Fitness Focused', 'Homebody', 'Social Butterfly', 'Workaholic',
    'Creative/Artistic', 'Spiritual/Mindful', 'Adventurous', 'Intellectual',
    'Family-Oriented', 'Career-Focused', 'Health Conscious', 'Tech Savvy'
  ];

  const interests = [
    'Reading', 'Movies/TV', 'Music', 'Cooking', 'Travel', 'Photography',
    'Art', 'Sports', 'Gaming', 'Dancing', 'Hiking', 'Yoga',
    'Volunteering', 'Learning Languages', 'Writing', 'Gardening'
  ];

  const toggleLifestyle = (item: string) => {
    const newLifestyle = formData.lifestyle.includes(item)
      ? formData.lifestyle.filter((l: string) => l !== item)
      : [...formData.lifestyle, item];
    updateFormData({ lifestyle: newLifestyle });
  };

  const toggleInterest = (item: string) => {
    const newInterests = formData.interests.includes(item)
      ? formData.interests.filter((i: string) => i !== item)
      : [...formData.interests, item];
    updateFormData({ interests: newInterests });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Lifestyle</h3>
        <p className="text-gray-600 mb-4">Select all that describe you:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {lifestyleOptions.map((item) => (
            <motion.button
              key={item}
              onClick={() => toggleLifestyle(item)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                formData.lifestyle.includes(item)
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-200 hover:border-pink-300 text-gray-700'
              }`}
            >
              {item}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Interests & Hobbies</h3>
        <p className="text-gray-600 mb-4">What do you enjoy doing?</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {interests.map((item) => (
            <motion.button
              key={item}
              onClick={() => toggleInterest(item)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                formData.interests.includes(item)
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300 text-gray-700'
              }`}
            >
              {item}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;