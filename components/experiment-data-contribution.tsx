"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/file-uploader"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Send, FileCheck, BarChart3, CheckCircle2, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"

interface ExperimentDataContributionProps {
  experimentId: string
  experimentName: string
  dataTypes: Array<"tabular" | "anecdotal" | "survey" | "file" | "measurement">
  onSubmit?: (data: any) => void
}

export function ExperimentDataContribution({
  experimentId,
  experimentName,
  dataTypes = ["tabular", "anecdotal", "survey", "file", "measurement"],
  onSubmit,
}: ExperimentDataContributionProps) {
  const [activeTab, setActiveTab] = useState<string>(dataTypes[0] || "tabular")
  const [submissionStep, setSubmissionStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [progress, setProgress] = useState(0)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)

  // Form data states
  const [tabularData, setTabularData] = useState<Record<string, string>>({})
  const [anecdotalData, setAnecdotalData] = useState("")
  const [surveyResponses, setSurveyResponses] = useState<Record<string, string | boolean | number>>({})
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [measurementData, setMeasurementData] = useState<Record<string, number>>({})

  // Comparison metrics (simulated)
  const [metrics, setMetrics] = useState<{
    percentile?: number
    similarResponses?: number
    totalContributions?: number
    uniqueInsight?: boolean
  }>({})

  // Sample survey questions
  const surveyQuestions = [
    {
      id: "experience",
      type: "radio",
      question: "How would you rate your experience with this phenomenon?",
      options: ["Novice", "Intermediate", "Advanced", "Expert"],
    },
    {
      id: "frequency",
      type: "radio",
      question: "How frequently have you observed this?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very frequently"],
    },
    {
      id: "factors",
      type: "checkbox",
      question: "Which factors do you believe influence the results? (Select all that apply)",
      options: ["Temperature", "Time of day", "Environment", "Subject preparation", "Equipment calibration"],
    },
    {
      id: "confidence",
      type: "slider",
      question: "How confident are you in your observations?",
      min: 0,
      max: 100,
      step: 1,
    },
  ]

  // Sample tabular data fields
  const tabularFields = [
    { id: "observation_date", label: "Observation Date", type: "date" },
    { id: "temperature", label: "Temperature (°C)", type: "number" },
    { id: "duration", label: "Duration (minutes)", type: "number" },
    { id: "subject_id", label: "Subject ID", type: "text" },
    { id: "result_value", label: "Result Value", type: "number" },
  ]

  // Sample measurement fields
  const measurementFields = [
    { id: "reaction_time", label: "Reaction Time (ms)", min: 100, max: 1000 },
    { id: "accuracy", label: "Accuracy (%)", min: 0, max: 100 },
    { id: "intensity", label: "Intensity Level", min: 1, max: 10 },
  ]

  // Handle file selection
  const handleFileChange = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files])
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    // Simulate API call
    setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)

      // Collect all data
      const submissionData = {
        experimentId,
        timestamp: new Date().toISOString(),
        tabularData: activeTab === "tabular" ? tabularData : undefined,
        anecdotalData: activeTab === "anecdotal" ? anecdotalData : undefined,
        surveyResponses: activeTab === "survey" ? surveyResponses : undefined,
        files: activeTab === "file" ? selectedFiles.map((f) => f.name) : undefined,
        measurementData: activeTab === "measurement" ? measurementData : undefined,
      }

      // Generate simulated comparison metrics
      setMetrics({
        percentile: Math.floor(Math.random() * 100),
        similarResponses: Math.floor(Math.random() * 50) + 5,
        totalContributions: Math.floor(Math.random() * 500) + 100,
        uniqueInsight: Math.random() > 0.7,
      })

      if (onSubmit) {
        onSubmit(submissionData)
      }

      // Show success state
      setIsSubmitting(false)
      setIsSubmitted(true)

      // Trigger confetti effect
      if (confettiCanvasRef.current) {
        const canvas = confettiCanvasRef.current
        const myConfetti = confetti.create(canvas, {
          resize: true,
          useWorker: true,
        })

        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }, 2000)
  }

  // Reset the form
  const handleReset = () => {
    setTabularData({})
    setAnecdotalData("")
    setSurveyResponses({})
    setSelectedFiles([])
    setMeasurementData({})
    setIsSubmitted(false)
    setSubmissionStep(1)
  }

  // Handle survey response changes
  const handleSurveyChange = (questionId: string, value: string | boolean | number) => {
    setSurveyResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // Handle tabular data changes
  const handleTabularChange = (fieldId: string, value: string) => {
    setTabularData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  // Handle measurement data changes
  const handleMeasurementChange = (fieldId: string, value: number) => {
    setMeasurementData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  return (
    <div className="relative">
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: "100%", height: "100%" }}
      />

      <Card className="border-accent/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-accent" />
            Contribute Data to {experimentName}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Thank You for Your Contribution!</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Your data has been successfully submitted and will help advance this research.
                  </p>

                  <div className="w-full max-w-md bg-accent/5 rounded-lg p-6 space-y-4">
                    <h4 className="font-medium flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-accent" />
                      How Your Data Compares
                    </h4>

                    <div className="space-y-3">
                      {metrics.percentile !== undefined && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Your result is in the top:</span>
                            <span className="font-medium">{metrics.percentile}%</span>
                          </div>
                          <Progress value={metrics.percentile} className="h-2" />
                        </div>
                      )}

                      {metrics.similarResponses !== undefined && (
                        <div className="flex justify-between text-sm py-2 border-b border-accent/10">
                          <span>Similar responses:</span>
                          <span className="font-medium">{metrics.similarResponses}</span>
                        </div>
                      )}

                      {metrics.totalContributions !== undefined && (
                        <div className="flex justify-between text-sm py-2 border-b border-accent/10">
                          <span>Total contributions:</span>
                          <span className="font-medium">{metrics.totalContributions}</span>
                        </div>
                      )}

                      {metrics.uniqueInsight && (
                        <div className="flex items-center gap-2 text-sm py-2 text-accent">
                          <Sparkles className="h-4 w-4" />
                          <span>Your data provided a unique insight!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={handleReset} className="bg-accent text-primary-foreground hover:bg-accent/90">
                    Contribute More Data
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <div className="flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        submissionStep >= 1 ? "bg-accent text-white" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      1
                    </div>
                    <div className={`h-1 flex-1 mx-2 ${submissionStep >= 2 ? "bg-accent" : "bg-secondary"}`}></div>
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        submissionStep >= 2 ? "bg-accent text-white" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      2
                    </div>
                    <div className={`h-1 flex-1 mx-2 ${submissionStep >= 3 ? "bg-accent" : "bg-secondary"}`}></div>
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        submissionStep >= 3 ? "bg-accent text-white" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      3
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Select Data Type</span>
                    <span>Enter Data</span>
                    <span>Review & Submit</span>
                  </div>
                </div>

                {submissionStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-medium mb-4">What type of data would you like to contribute?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dataTypes.includes("tabular") && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            activeTab === "tabular" ? "border-accent bg-accent/5" : "border-border"
                          }`}
                          onClick={() => setActiveTab("tabular")}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  activeTab === "tabular" ? "bg-accent/20" : "bg-secondary"
                                }`}
                              >
                                <BarChart3
                                  className={`h-5 w-5 ${activeTab === "tabular" ? "text-accent" : "text-foreground"}`}
                                />
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium">Tabular Data</h4>
                                <p className="text-xs text-muted-foreground">Enter structured measurements</p>
                              </div>
                            </div>
                            {activeTab === "tabular" && <ChevronRight className="h-5 w-5 text-accent" />}
                          </div>
                        </motion.div>
                      )}

                      {dataTypes.includes("anecdotal") && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            activeTab === "anecdotal" ? "border-accent bg-accent/5" : "border-border"
                          }`}
                          onClick={() => setActiveTab("anecdotal")}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  activeTab === "anecdotal" ? "bg-accent/20" : "bg-secondary"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={activeTab === "anecdotal" ? "text-accent" : "text-foreground"}
                                >
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium">Anecdotal</h4>
                                <p className="text-xs text-muted-foreground">Share your observations</p>
                              </div>
                            </div>
                            {activeTab === "anecdotal" && <ChevronRight className="h-5 w-5 text-accent" />}
                          </div>
                        </motion.div>
                      )}

                      {dataTypes.includes("survey") && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            activeTab === "survey" ? "border-accent bg-accent/5" : "border-border"
                          }`}
                          onClick={() => setActiveTab("survey")}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  activeTab === "survey" ? "bg-accent/20" : "bg-secondary"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={activeTab === "survey" ? "text-accent" : "text-foreground"}
                                >
                                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                  <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                                  <path d="M9 12h6" />
                                  <path d="M9 16h6" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium">Survey</h4>
                                <p className="text-xs text-muted-foreground">Answer specific questions</p>
                              </div>
                            </div>
                            {activeTab === "survey" && <ChevronRight className="h-5 w-5 text-accent" />}
                          </div>
                        </motion.div>
                      )}

                      {dataTypes.includes("file") && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            activeTab === "file" ? "border-accent bg-accent/5" : "border-border"
                          }`}
                          onClick={() => setActiveTab("file")}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  activeTab === "file" ? "bg-accent/20" : "bg-secondary"
                                }`}
                              >
                                <FileCheck
                                  className={`h-5 w-5 ${activeTab === "file" ? "text-accent" : "text-foreground"}`}
                                />
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium">File Upload</h4>
                                <p className="text-xs text-muted-foreground">Upload data files</p>
                              </div>
                            </div>
                            {activeTab === "file" && <ChevronRight className="h-5 w-5 text-accent" />}
                          </div>
                        </motion.div>
                      )}

                      {dataTypes.includes("measurement") && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            activeTab === "measurement" ? "border-accent bg-accent/5" : "border-border"
                          }`}
                          onClick={() => setActiveTab("measurement")}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  activeTab === "measurement" ? "bg-accent/20" : "bg-secondary"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={activeTab === "measurement" ? "text-accent" : "text-foreground"}
                                >
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium">Measurements</h4>
                                <p className="text-xs text-muted-foreground">Record specific measurements</p>
                              </div>
                            </div>
                            {activeTab === "measurement" && <ChevronRight className="h-5 w-5 text-accent" />}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setSubmissionStep(2)}
                        className="bg-accent text-primary-foreground hover:bg-accent/90"
                      >
                        Continue
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {submissionStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="hidden">
                        {dataTypes.map((type) => (
                          <TabsTrigger key={type} value={type}>
                            {type}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="tabular" className="space-y-4 mt-0">
                        <h3 className="text-lg font-medium">Enter Tabular Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Please provide the following measurements for your observation.
                        </p>

                        <div className="grid gap-4 py-4">
                          {tabularFields.map((field) => (
                            <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor={field.id} className="text-right">
                                {field.label}
                              </Label>
                              <Input
                                id={field.id}
                                type={field.type}
                                className="col-span-3"
                                value={tabularData[field.id] || ""}
                                onChange={(e) => handleTabularChange(field.id, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="anecdotal" className="space-y-4 mt-0">
                        <h3 className="text-lg font-medium">Share Your Observations</h3>
                        <p className="text-sm text-muted-foreground">
                          Please describe your experience or observations related to this experiment in detail.
                        </p>

                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="anecdote">Your Observation</Label>
                            <Textarea
                              id="anecdote"
                              placeholder="Describe what you observed..."
                              className="min-h-[200px]"
                              value={anecdotalData}
                              onChange={(e) => setAnecdotalData(e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="survey" className="space-y-4 mt-0">
                        <h3 className="text-lg font-medium">Survey Questions</h3>
                        <p className="text-sm text-muted-foreground">
                          Please answer the following questions about your experience.
                        </p>

                        <div className="space-y-6 py-4">
                          {surveyQuestions.map((question) => (
                            <div key={question.id} className="space-y-3">
                              <Label>{question.question}</Label>

                              {question.type === "radio" && (
                                <RadioGroup
                                  value={surveyResponses[question.id] as string}
                                  onValueChange={(value) => handleSurveyChange(question.id, value)}
                                >
                                  <div className="grid grid-cols-2 gap-2">
                                    {question.options?.map((option) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                                      </div>
                                    ))}
                                  </div>
                                </RadioGroup>
                              )}

                              {question.type === "checkbox" && (
                                <div className="grid grid-cols-2 gap-2">
                                  {question.options?.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${question.id}-${option}`}
                                        checked={surveyResponses[`${question.id}-${option}`] as boolean | undefined}
                                        onCheckedChange={(checked) =>
                                          handleSurveyChange(`${question.id}-${option}`, Boolean(checked))
                                        }
                                      />
                                      <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {question.type === "slider" && (
                                <div className="space-y-4">
                                  <div className="flex justify-between">
                                    <span className="text-sm">Not confident</span>
                                    <span className="text-sm font-medium">
                                      {surveyResponses[question.id] !== undefined
                                        ? `${surveyResponses[question.id]}%`
                                        : "50%"}
                                    </span>
                                    <span className="text-sm">Very confident</span>
                                  </div>
                                  <Slider
                                    defaultValue={[50]}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => handleSurveyChange(question.id, value[0])}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="file" className="space-y-4 mt-0">
                        <h3 className="text-lg font-medium">Upload Data Files</h3>
                        <p className="text-sm text-muted-foreground">
                          Please upload any relevant data files for this experiment.
                        </p>

                        <div className="py-4">
                          <FileUploader onChange={handleFileChange} />

                          {selectedFiles.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                              <ul className="space-y-2">
                                {selectedFiles.map((file, index) => (
                                  <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between bg-secondary/30 p-2 rounded-md"
                                  >
                                    <div className="flex items-center">
                                      <FileCheck className="h-4 w-4 text-accent mr-2" />
                                      <span className="text-sm">
                                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                      </span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                                    >
                                      ×
                                    </Button>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="measurement" className="space-y-4 mt-0">
                        <h3 className="text-lg font-medium">Record Measurements</h3>
                        <p className="text-sm text-muted-foreground">
                          Please provide the following specific measurements for your observation.
                        </p>

                        <div className="space-y-6 py-4">
                          {measurementFields.map((field) => (
                            <div key={field.id} className="space-y-3">
                              <div className="flex justify-between">
                                <Label htmlFor={field.id}>{field.label}</Label>
                                <span className="text-sm font-medium">
                                  {measurementData[field.id] !== undefined ? measurementData[field.id] : "-"}
                                </span>
                              </div>
                              <Slider
                                id={field.id}
                                min={field.min}
                                max={field.max}
                                step={1}
                                defaultValue={[Math.floor((field.min + field.max) / 2)]}
                                onValueChange={(value) => handleMeasurementChange(field.id, value[0])}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{field.min}</span>
                                <span>{field.max}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setSubmissionStep(1)}>
                        Back
                      </Button>
                      <Button
                        onClick={() => setSubmissionStep(3)}
                        className="bg-accent text-primary-foreground hover:bg-accent/90"
                      >
                        Continue
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {submissionStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-medium">Review & Submit</h3>
                    <p className="text-sm text-muted-foreground">
                      Please review your contribution before submitting. This data will be added to the experiment.
                    </p>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Contribution Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Data Type:</span>
                          <span className="font-medium capitalize">{activeTab}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Experiment:</span>
                          <span className="font-medium">{experimentName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Timestamp:</span>
                          <span className="font-medium">{new Date().toLocaleString()}</span>
                        </div>

                        {activeTab === "file" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Files:</span>
                            <span className="font-medium">{selectedFiles.length} file(s)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setSubmissionStep(2)}>
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-accent text-primary-foreground hover:bg-accent/90"
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Contribution
                          </>
                        )}
                      </Button>
                    </div>

                    {isSubmitting && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Uploading data...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
