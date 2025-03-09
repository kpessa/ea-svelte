import type { Meta, StoryObj } from '@storybook/svelte';
import PatientHeader from './PatientHeader.svelte';

const meta = {
    title: 'Components/PatientHeader',
    component: PatientHeader,
    tags: ['autodocs'],
    argTypes: {
        patientData: {
            control: 'object',
            description: 'Patient information to display in the header'
        }
    }
} satisfies Meta<PatientHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        patientData: {
            name: "TEST, PATIENT",
            dob: "02/19/1984",
            age: "41 Years",
            sex: "Female",
            visitType: "-",
            location: "-",
            attending: "-",
            emr: "26903044",
            fin: "ATK50000000036 48888532"
        }
    }
};

export const WithFullInformation: Story = {
    args: {
        patientData: {
            name: "SMITH, JOHN",
            dob: "05/15/1975",
            age: "48 Years",
            sex: "Male",
            visitType: "Inpatient",
            location: "Room 302-A",
            attending: "Dr. Sarah Johnson",
            emr: "27845691",
            fin: "ATK50000000037 48888533"
        }
    }
};

export const PediatricPatient: Story = {
    args: {
        patientData: {
            name: "BABY, JANE",
            dob: "01/10/2023",
            age: "1 Year",
            sex: "Female",
            visitType: "Emergency",
            location: "Peds ER",
            attending: "Dr. Michael Chen",
            emr: "27845692",
            fin: "ATK50000000038 48888534"
        }
    }
}; 