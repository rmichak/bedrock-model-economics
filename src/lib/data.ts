import groupsJson from '../data/groups.json'
import localModelsJson from '../data/localModels.json'
import metaJson from '../data/meta.json'
import modelsJson from '../data/models.json'
import tasksJson from '../data/tasks.json'
import type { Group, LocalModel, Model, Task } from './types'

export const MODELS = modelsJson as Model[]
export const LOCAL_MODELS = localModelsJson as LocalModel[]
export const TASKS = tasksJson as Task[]
export const GROUPS = groupsJson as Group[]
export const META = metaJson as {
  asOf: string
  indexVersion: string
  sources: { label: string; url: string }[]
}
