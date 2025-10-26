"use client"
import type { WorkflowStep } from "@/lib/types"

interface WorkflowTimelineProps {
  steps: WorkflowStep[]
}

export default function WorkflowTimeline({ steps }: WorkflowTimelineProps) {
  const stepLabels: Record<string, string> = {
    cooking: "Cocinando",
    packing: "Empacando",
    delivery: "Entregando",
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                step.status === "completed"
                  ? "bg-green-500"
                  : step.status === "in_progress"
                    ? "bg-blue-500"
                    : "bg-gray-300"
              }`}
            >
              {step.status === "completed" ? "✓" : index + 1}
            </div>
            {index < steps.length - 1 && <div className="w-1 h-12 bg-gray-300 mt-2"></div>}
          </div>
          <div className="pb-4">
            <p className="font-bold">{stepLabels[step.stepType]}</p>
            <p className="text-sm text-gray-600">Estado: {step.status}</p>
            {step.assignedTo && <p className="text-sm text-gray-600">Asignado a: {step.assignedTo}</p>}
            {step.startTime && (
              <p className="text-xs text-gray-500">Inicio: {new Date(step.startTime).toLocaleTimeString("es-PE")}</p>
            )}
            {step.endTime && (
              <p className="text-xs text-gray-500">Fin: {new Date(step.endTime).toLocaleTimeString("es-PE")}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
