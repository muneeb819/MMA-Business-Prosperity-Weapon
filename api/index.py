import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
from app.models.database import create_tables, seed_if_needed
from mangum import Mangum

create_tables()
seed_if_needed()

handler = Mangum(app, lifespan="off")
