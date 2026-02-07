-- Memora Supabase Security Script
-- This script enables RLS and adds policies for caregivers to manage their own patients' data.

-- 1. Enable RLS on all critical tables
ALTER TABLE public."Memory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MemoryPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SessionMemory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TherapySession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FamilyMember" ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for Caregivers (Portal Users)
-- Note: Assumes auth.uid() is the caregiver's user ID

-- Memory Policy
CREATE POLICY "Caregivers can manage their own patients' memories" 
ON public."Memory" FOR ALL 
USING (EXISTS (SELECT 1 FROM public."Patient" p WHERE p.id = "patientId" AND p."caregiverId" = auth.uid()));

-- MemoryPhoto Policy
CREATE POLICY "Caregivers can manage their own patients' memory photos" 
ON public."MemoryPhoto" FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public."Memory" m 
    JOIN public."Patient" p ON m."patientId" = p.id 
    WHERE m.id = "memoryId" AND p."caregiverId" = auth.uid()
));

-- SessionMemory Policy
CREATE POLICY "Caregivers can manage their own patients' session memories" 
ON public."SessionMemory" FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public."TherapySession" s 
    JOIN public."Patient" p ON s."patientId" = p.id 
    WHERE s.id = "sessionId" AND p."caregiverId" = auth.uid()
));

-- TherapySession Policy
CREATE POLICY "Caregivers can manage their own patients' sessions" 
ON public."TherapySession" FOR ALL 
USING (EXISTS (SELECT 1 FROM public."Patient" p WHERE p.id = "patientId" AND p."caregiverId" = auth.uid()));

-- Patient Policy
CREATE POLICY "Caregivers can manage their own patients" 
ON public."Patient" FOR ALL 
USING ("caregiverId" = auth.uid());

-- FamilyMember Policy
CREATE POLICY "Caregivers can manage family members" 
ON public."FamilyMember" FOR ALL 
USING (EXISTS (SELECT 1 FROM public."Patient" p WHERE p.id = "patientId" AND p."caregiverId" = auth.uid()));
