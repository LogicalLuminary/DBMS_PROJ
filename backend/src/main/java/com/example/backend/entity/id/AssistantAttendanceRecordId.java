package com.example.backend.entity.id;

import java.io.Serializable;
import java.time.LocalDate;

public class AssistantAttendanceRecordId implements Serializable {

    private LocalDate Date;

    private Integer Assistant_id;

    public AssistantAttendanceRecordId() {}

    public AssistantAttendanceRecordId(LocalDate Date, Integer Assistant_id) {
        this.Date = Date;
        this.Assistant_id = Assistant_id;
    }
    public LocalDate getDate() { return Date; }
    public void setDate(LocalDate Date) { this.Date = Date; }

    public Integer getAssistant_id() { return Assistant_id; }
    public void setAssistant_id(Integer Assistant_id) { this.Assistant_id = Assistant_id; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AssistantAttendanceRecordId other)) return false;
        return java.util.Objects.equals(Date, other.Date) && java.util.Objects.equals(Assistant_id, other.Assistant_id);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(Date, Assistant_id);
    }
}