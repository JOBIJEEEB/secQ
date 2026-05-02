import os
import time
from zapv2 import ZAPv2
from supabase import create_client, Client

# Use environment variables for production secrets
SUPABASE_URL = os.getenv("SUPABASE_URL")
# IMPORTANT: Use the Service Role Key to bypass RLS for inserting vulnerabilities
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("FATAL ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing.")
    exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize ZAP API client
# Assuming ZAP is running on localhost:8080 or defined via ZAP_URL
ZAP_URL = os.getenv("ZAP_URL", "http://localhost:8080")
ZAP_API_KEY = os.getenv("ZAP_API_KEY", "") # If your ZAP daemon uses an API key

try:
    zap = ZAPv2(apikey=ZAP_API_KEY, proxies={'http': ZAP_URL, 'https': ZAP_URL})
except Exception as e:
    print(f"Error initializing ZAP API client: {e}")
    exit(1)

def get_pending_scans():
    """
    Fetch scans that have not yet had deep backend ZAP processing.
    You might use a 'processing_status' or look for scans missing vulnerabilities.
    For demonstration, we fetch scans where we haven't flagged them as 'ZAP_COMPLETED'
    (If your schema uses 'Pending', replace the query accordingly).
    """
    try:
        # Assuming there is a column 'backend_status' = 'Pending' or similar.
        # Modify this query based on how your frontend flags new scans to the worker!
        res = supabase.table("scans").select("*").eq("backend_status", "Pending").execute()
        return res.data
    except Exception as e:
        print(f"Error fetching pending scans from Supabase: {e}")
        return []

def run_zap_scan(target):
    """
    Orchestrate the OWASP ZAP active scan against the target.
    """
    print(f"Starting deep OWASP ZAP scan for target: {target}")
    try:
        # 1. Access the target
        zap.urlopen(target)
        time.sleep(2)
        
        # 2. Spider the target (discover URLs)
        print(f"Spidering target {target}...")
        spider_id = zap.spider.scan(target)
        time.sleep(2)
        while int(zap.spider.status(spider_id)) < 100:
            print(f"Spider progress: {zap.spider.status(spider_id)}%")
            time.sleep(2)
        print("Spider phase completed.")

        # 3. Active Scan the target (probe for vulnerabilities)
        print(f"Active scanning target {target}...")
        ascan_id = zap.ascan.scan(target)
        time.sleep(2)
        while int(zap.ascan.status(ascan_id)) < 100:
            print(f"Active scan progress: {zap.ascan.status(ascan_id)}%")
            time.sleep(5)
        print("Active scan phase completed.")
        
        # 4. Retrieve all generated alerts
        print(f"Retrieving alerts for {target}...")
        alerts = zap.core.alerts(baseurl=target)
        return alerts
    
    except Exception as e:
        print(f"ZAP Scanning Error for {target}: {e}")
        raise e

def map_and_insert_vulnerabilities(alerts, scan_id):
    """
    Map ZAP JSON alerts to Supabase schema and batch insert.
    """
    if not alerts:
        print(f"No ZAP alerts found for scan_id: {scan_id}")
        return

    vulnerabilities_to_insert = []
    
    # Iterate through every single alert found
    for alert in alerts:
        # Normalize ZAP's risk wording to match Supabase's Expected Schema
        raw_risk = alert.get('risk', 'Informational')
        severity_map = {
            "0": "Info",
            "1": "Low",
            "2": "Medium",
            "3": "High",
            "Informational": "Info"
        }
        severity = severity_map.get(raw_risk, raw_risk)
        
        # Determine evidence payload
        evidence = alert.get('evidence', '') or alert.get('param', '') or alert.get('url', '')
        
        vuln_record = {
            "scan_id": scan_id,
            "title": alert.get('alert', 'Unknown Vulnerability'),
            "severity": severity,
            "description": alert.get('description', 'No description provided by ZAP.'),
            "evidence": evidence,
            "mitigation": alert.get('solution', 'No mitigation steps provided.')
        }
        vulnerabilities_to_insert.append(vuln_record)
    
    # Perform Batch Insert to Supabase vulnerabilities table
    try:
        print(f"Mapped {len(vulnerabilities_to_insert)} vulnerabilities. Attempting bulk insert into Supabase...")
        res = supabase.table("vulnerabilities").insert(vulnerabilities_to_insert).execute()
        print(f"Successfully inserted vulnerabilities for scan_id: {scan_id}")
    except Exception as e:
        print(f"Supabase Insertion Error for scan_id {scan_id}: {e}")
        raise e

def process_scan(scan):
    scan_id = scan['id']
    target = scan['target']
    
    try:
        # Mark as processing in DB (Optional, based on your schema)
        supabase.table("scans").update({"backend_status": "Processing"}).eq("id", scan_id).execute()
        
        alerts = run_zap_scan(target)
        
        # Map and batch insert vulnerabilities
        map_and_insert_vulnerabilities(alerts, scan_id)
        
        # Mark as completed
        supabase.table("scans").update({"backend_status": "Completed"}).eq("id", scan_id).execute()
        
    except Exception as e:
        print(f"Failed to fully process scan {scan_id}: {e}")
        try:
             supabase.table("scans").update({"backend_status": "Failed"}).eq("id", scan_id).execute()
        except:
             pass

def main():
    print("secQ ZAP Worker started. Listening for pending scans...")
    # Polling loop
    while True:
        scans = get_pending_scans()
        for scan in scans:
            print(f"--- Picked up pending scan: {scan['id']} for {scan['target']} ---")
            process_scan(scan)
        time.sleep(10) # Poll every 10 seconds

if __name__ == "__main__":
    main()
