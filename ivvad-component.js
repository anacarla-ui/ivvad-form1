import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const IVVADForm = () => {
  // Estado para cada sección de puntuaciones
  const [individualFactors, setIndividualFactors] = useState({
    age: null,
    gender: null,
    education: null,
    professionalization: null,
    neuropsychDiagnosis: null,
    psychologicalDisorders: null,
    screenTime: null,
    nightScreenUse: null,
    contentType: null,
    algorithmUse: null
  });

  const [socialFactors, setSocialFactors] = useState({
    socialClass: null,
    race: null,
    disability: null,
    violenceHistory: null,
    infractionalAct: null,
    housing: null,
    migration: null,
    cultureAccess: null,
    sportsActivity: null,
    freeTime: null,
    digitalContentType: null
  });

  const [digitalEducation, setDigitalEducation] = useState({
    digitalEducationAccess: null,
    algorithmAwareness: null,
    identifyMisinformation: null
  });

  const [parentalSupervision, setParentalSupervision] = useState({
    technologySupervision: null,
    digitalWorldDialogue: null,
    accessControl: null
  });

  // Estado para puntuaciones totales e índice final
  const [scores, setScores] = useState({
    individualTotal: 0,
    socialTotal: 0,
    educationTotal: 0, 
    supervisionTotal: 0,
    ivvadIndex: 0,
    vulnerabilityLevel: "",
    interventionSuggestion: ""
  });

  // Estado para el proceso de envío
  const [submissionStatus, setSubmissionStatus] = useState({
    submitted: false,
    success: false,
    error: null,
    loading: false
  });

  // Función para manejar cambios de entrada para Factores Individuales
  const handleIndividualChange = (field, value) => {
    setIndividualFactors(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  // Función para manejar cambios de entrada para Factores Sociales
  const handleSocialChange = (field, value) => {
    setSocialFactors(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  // Función para manejar cambios de entrada para Educación Digital
  const handleEducationChange = (field, value) => {
    setDigitalEducation(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  // Función para manejar cambios de entrada para Supervisión Parental
  const handleSupervisionChange = (field, value) => {
    setParentalSupervision(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  // Calcular las puntuaciones cuando cambia cualquier entrada
  useEffect(() => {
    // Calcular sumas para cada sección
    const individualTotal = Object.values(individualFactors).reduce((sum, value) => 
      value !== null ? sum + value : sum, 0);
    
    const socialTotal = Object.values(socialFactors).reduce((sum, value) => 
      value !== null ? sum + value : sum, 0);
    
    const educationTotal = Object.values(digitalEducation).reduce((sum, value) => 
      value !== null ? sum + value : sum, 0);
    
    const supervisionTotal = Object.values(parentalSupervision).reduce((sum, value) => 
      value !== null ? sum + value : sum, 0);
    
    // Calcular índice IVVAD
    const totalCriteria = 27; // Número total de criterios
    const totalSum = individualTotal + socialTotal + educationTotal + supervisionTotal;
    const ivvadIndex = (totalSum / (totalCriteria * 2)) * 100;
    
    // Determinar nivel de vulnerabilidad y sugerencia de intervención
    let vulnerabilityLevel = "";
    let interventionSuggestion = "";
    
    if (ivvadIndex <= 20) {
      vulnerabilityLevel = "Baixa Vulnerabilidade à Violência Algorítmica Desenvolvimental";
      interventionSuggestion = "Monitoramento regular, educação continuada";
    } else if (ivvadIndex <= 50) {
      vulnerabilityLevel = "Moderada Vulnerabilidade à Violência Algorítmica Desenvolvimental";
      interventionSuggestion = "Acompanhamento e orientação familiar";
    } else if (ivvadIndex <= 75) {
      vulnerabilityLevel = "Alta Vulnerabilidade à Violência Algorítmica Desenvolvimental";
      interventionSuggestion = "Intervenção psicológica e educativa";
    } else {
      vulnerabilityLevel = "Muito Alta Vulnerabilidade à Violência Algorítmica Desenvolvimental";
      interventionSuggestion = "Acompanhamento clínico e social prioritário";
    }
    
    // Actualizar estado de puntuaciones
    setScores({
      individualTotal,
      socialTotal,
      educationTotal,
      supervisionTotal,
      ivvadIndex: ivvadIndex.toFixed(2),
      vulnerabilityLevel,
      interventionSuggestion
    });
  }, [individualFactors, socialFactors, digitalEducation, parentalSupervision]);

  // Función para crear un grupo de radio para un criterio
  const createRadioGroup = (section, field, label, options, handleChange) => {
    let value;
    
    switch(section) {
      case 'individual':
        value = individualFactors[field];
        break;
      case 'social':
        value = socialFactors[field];
        break;
      case 'education':
        value = digitalEducation[field];
        break;
      case 'supervision':
        value = parentalSupervision[field];
        break;
      default:
        value = null;
    }

    return (
      <div className="mb-4 border-b pb-4">
        <div className="font-medium mb-2">{label}</div>
        <div className="grid grid-cols-3 gap-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={`${field}-${index}`}
                name={field}
                value={index}
                checked={value === index}
                onChange={() => handleChange(field, index)}
                className="mr-2"
              />
              <label htmlFor={`${field}-${index}`} className="text-sm">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Función para restablecer formulario
  const resetForm = () => {
    setIndividualFactors({
      age: null,
      gender: null,
      education: null,
      professionalization: null,
      neuropsychDiagnosis: null,
      psychologicalDisorders: null,
      screenTime: null,
      nightScreenUse: null,
      contentType: null,
      algorithmUse: null
    });
    
    setSocialFactors({
      socialClass: null,
      race: null,
      disability: null,
      violenceHistory: null,
      infractionalAct: null,
      housing: null,
      migration: null,
      cultureAccess: null,
      sportsActivity: null,
      freeTime: null,
      digitalContentType: null
    });
    
    setDigitalEducation({
      digitalEducationAccess: null,
      algorithmAwareness: null,
      identifyMisinformation: null
    });
    
    setParentalSupervision({
      technologySupervision: null,
      digitalWorldDialogue: null,
      accessControl: null
    });

    setSubmissionStatus({
      submitted: false,
      success: false,
      error: null,
      loading: false
    });
  };

  // Calcular porcentaje de finalización
  const calculateCompletionPercentage = () => {
    const totalFields = 27;
    const filledFields = 
      Object.values(individualFactors).filter(v => v !== null).length +
      Object.values(socialFactors).filter