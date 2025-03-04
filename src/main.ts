import './app.css'
import App from './App.svelte'
import { config } from '$lib/stores'
import { sampleConfig } from '$lib/config/sample'

// Initialize with sample configuration
config.set(sampleConfig)

const target = document.getElementById('app') as HTMLElement
if (target) {
    new App({
        target
    })
}

export default app
