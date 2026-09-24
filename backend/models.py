from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Deviation(Base):
    __tablename__ = "deviations"

    id = Column(Integer, primary_key=True, index=True)
    site = Column(String(255), index=True)
    dateOfOccurrence = Column(String(50))
    title = Column(String(255), index=True)
    source = Column(String(255))
    relatedProduct = Column(String(255))
    batchNumber = Column(String(255))
    description = Column(Text)
    initialImpact = Column(String(50))
    initialSeverity = Column(String(50))
    aiExplanation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
