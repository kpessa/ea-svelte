<script lang="ts">
    // Mock patient data - in a real app, this would come from a service
    export let patientData = {
        name: "TEST, PATIENT",
        dob: "02/19/1984",
        age: "41 Years",
        sex: "Female",
        visitType: "-",
        location: "-",
        attending: "-",
        emr: "26903044",
        fin: "ATK50000000036 48888532"
    };
</script>

<div class="patient-header bg-clinical-blue text-white p-3 flex justify-between items-center shadow-md">
    <div class="patient-info flex flex-col">
        <div class="font-bold text-lg">{patientData.name}</div>
        <div class="text-sm">
            DOB: {patientData.dob} <span class="badge bg-white text-clinical-blue ml-1 px-2 py-0.5 rounded-full">{patientData.age}</span>
        </div>
        <div class="text-sm">
            Sex: {patientData.sex}
        </div>
    </div>
    
    <div class="visit-info flex flex-col text-sm">
        <div>Visit Type: {patientData.visitType}</div>
        <div>Location: {patientData.location}</div>
        <div>Attending: {patientData.attending}</div>
    </div>
    
    <div class="identifiers flex flex-col text-sm text-right">
        <div>EMR: <span class="font-mono">{patientData.emr}</span></div>
        <div>FIN: <span class="font-mono">{patientData.fin}</span></div>
    </div>
</div>

<style>
    .patient-header {
        font-family: var(--font-sans);
        border-bottom: 1px solid var(--color-gray-300);
    }
    
    .badge {
        font-size: 0.75rem;
        font-weight: 600;
    }
</style> 