# Fabric notebook source

# METADATA ********************

# META {
# META   "kernel_info": {
# META     "name": "synapse_pyspark"
# META   },
# META   "dependencies": {
# META     "lakehouse": {
# META       "default_lakehouse": "7d5e74ce-ab5f-4c6c-b180-5d177a09d96d",
# META       "default_lakehouse_name": "Northwind",
# META       "default_lakehouse_workspace_id": "3c776327-695d-4fd4-8f84-3ffbde979c5a"
# META     }
# META   }
# META }

# CELL ********************

# Welcome to your new notebook
# Type here in the cell editor to add code!
print("yoooooo")

# METADATA ********************

# META {
# META   "language": "python",
# META   "language_group": "synapse_pyspark"
# META }

# CELL ********************

# Not supported
df = spark.read.format("xlsx").option("header","true").load()

# METADATA ********************

# META {
# META   "language": "python",
# META   "language_group": "synapse_pyspark"
# META }
