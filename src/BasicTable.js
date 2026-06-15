import React, { useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import "./BasicTable.css"

function BasicTable({ tableId = "coursePicker", rows, addToCourseList, showCheckbox, showIndex = false, initiallySorted = true, selectedCourses }) {
  const [sortedRows, setSortedRows] = useState(rows)
  const [currentlySortedBy, setCurrentlySortedBy] = useState("")
  const [sortDirection, setSortDirection] = useState("ascending")

  useEffect(() => {
    if (initiallySorted) setCurrentlySortedBy("Course")
  }, [])

  useEffect(() => {
    sortRows(currentlySortedBy)
  }, [currentlySortedBy, sortDirection])


  useEffect(() => {
    sortRows(currentlySortedBy)
  }, [rows.length])

  const handleHeaderClick = (event) => {
    // currentTarget is always the <th>, even if the click landed on the sort
    // arrow inside it; its first child is the header label text.
    const column = event.currentTarget.childNodes[0]?.textContent.trim();

    // Re-clicking the sorted column flips direction; a new column starts ascending.
    const nextDirection =
      column === currentlySortedBy && sortDirection === "ascending" ? "descending" : "ascending";

    setCurrentlySortedBy(column);
    setSortDirection(nextDirection);

    // GA4 custom event: which column header users sort by (see public/index.html gtag setup)
    window.gtag?.('event', 'column_sort', { table_id: tableId, column, direction: nextDirection });
  }

  const sortCompareFunction = (a, b, propertyName, direction) => {
    let aValue, bValue;

    if (propertyName === 'ratingDifficultyRatio') {
      aValue = a.rating / a.difficulty;
      bValue = b.rating / b.difficulty;
    } else if (propertyName === 'ratingWorkloadRatio') {
      aValue = a.rating / a.workload;
      bValue = b.rating / b.workload;
    } else {
      aValue = a[propertyName];
      bValue = b[propertyName];
    }

    if ((aValue || 0) < (bValue || 0)) {
      return direction == "ascending" ? -1 : 1;
    }
    if ((aValue || 0) > (bValue || 0)) {
      return direction == "ascending" ? 1 : -1;
    }
    return 0;
  }

  const sortRows = (sortHeader) => {
    let propertyName;
    if (sortHeader === "Course") { propertyName = "name" }
    else if (sortHeader === "Foundational?") { propertyName = "isFoundational" }
    else if (sortHeader === "Rating") { propertyName = "rating" }
    else if (sortHeader === "Difficulty") { propertyName = "difficulty" }
    else if (sortHeader === "Rating:Difficulty") { propertyName = "ratingDifficultyRatio" }
    else if (sortHeader === "Workload") { propertyName = "workload" }
    else if (sortHeader === "Rating:Workload") { propertyName = "ratingWorkloadRatio" }
    else if (sortHeader === "Reviews") { propertyName = "reviewCount" }
    else if (sortHeader === "Code(s)") { propertyName = "codes" }
    setSortedRows(rows.toSorted((a, b) => sortCompareFunction(a, b, propertyName, sortDirection)))
    setSortDirection(sortDirection)
  }

  const formatNumber = (value) => {
    return value === null || Number.isNaN(value) || typeof value === "undefined" || !Number.isFinite(value)
      ? "N/A"
      : value.toFixed(2);
  }
  return (
    <div className="tableContainer">
          <Table striped bordered hover>
            <thead>
              <tr>
                { showIndex && <th>#</th>}
                { showCheckbox && <th>Add</th> }
                <th onClick={ handleHeaderClick }>
                  Course {currentlySortedBy === "Course" ? (sortDirection == "ascending" ? <span className="arrow">↑</span> : <span className="arrow">↓</span>) : null}
                </th>
                <th onClick={ handleHeaderClick }>
                  Rating {currentlySortedBy === "Rating" ? (sortDirection == "ascending" ? <span className="arrow">↑</span> : <span className="arrow">↓</span>) : null}
                </th>
                <th onClick={ handleHeaderClick }>
                  Difficulty {currentlySortedBy === "Difficulty" ? (sortDirection == "ascending" ? <span className="arrow">↑</span> : <span className="arrow">↓</span>) : null}
                </th>
                <th onClick={ handleHeaderClick }>
                  Workload {currentlySortedBy === "Workload" ? (sortDirection == "ascending" ? <span className="arrow">↑</span> : <span className="arrow">↓</span>) : null}
                </th>
                <th onClick={ handleHeaderClick } className="hide-mobile">
                  Reviews {currentlySortedBy === "Reviews" ? (sortDirection == "ascending" ? <span className="arrow">↑</span> : <span className="arrow">↓</span>) : null}
                </th>
                <th onClick={ handleHeaderClick } className="hide-mobile">
                  Foundational? {currentlySortedBy === "Foundational?" ? (sortDirection == "ascending" ? <span className="arrow">↑</span> : <span className="arrow">↓</span>) : null}
                </th>
                <th onClick={ handleHeaderClick } className="hide-mobile col-codes">
                  Code(s) {currentlySortedBy === "Code(s)" ? (sortDirection == "ascending" ? <span className="arrow">↑</span> : <span className="arrow">↓</span>) : null}
                </th>
              </tr>
            </thead>
            <tbody>
              { sortedRows.length === 0 ? (
                <tr className="empty-table">
                  <td>There's nothing here yet. Pick a specialization and add some classes to populate your course list!</td>
                </tr>
              ) : sortedRows.map(
                (
                  {
                    id,
                    slug,
                    codes,
                    isFoundational,
                    name,
                    officialURL,
                    rating,
                    difficulty,
                    workload,
                    reviewCount,
                  },
                  index
                ) => (
                  <tr
                    key={id}
                    className={selectedCourses && selectedCourses.find(row => row.id === id) ? 'row-selected' : ''}
                  >
                    { showIndex && <td>{index + 1}</td> }
                    { showCheckbox && <td>
                      <input type="checkbox" className="course-checkbox"
                        aria-label={`Add ${name} to course list`}
                        checked={!!(selectedCourses && selectedCourses.find(row => row.id === id))}
                        onChange={(event) => {
                          // GA4 custom event: which courses users add/remove
                          window.gtag?.('event', 'course_select', {
                            table_id: tableId,
                            course: name,
                            code: codes?.join(', '),
                            action: event.target.checked ? 'add' : 'remove',
                          });
                          addToCourseList({
                            id,
                            slug,
                            codes,
                            isFoundational,
                            name,
                            officialURL,
                            rating,
                            difficulty,
                            workload,
                            reviewCount,
                          });
                        }}/>
                    </td> }
                    <td>
                      <div>{ name }</div>
                      <div>
                        <a href={officialURL} target="_blank" rel="noreferrer" aria-label={`${name} on the official GT site`}>GT Official</a> - {slug ? <a href={"https://www.omscentral.com/courses/" + slug + "/reviews"} target="_blank" rel="noreferrer" aria-label={`${name} reviews on OMSCentral`}>Reviews</a> : "No review page yet"}
                      </div>
                    </td>
                    <td>{ formatNumber(rating) }</td>
                    <td>{ formatNumber(difficulty) }</td>
                    <td>{ formatNumber(workload) }</td>
                    <td className="hide-mobile">{ reviewCount }</td>
                    <td className="hide-mobile">{ isFoundational ? "yes" : "no" }</td>
                    <td className="hide-mobile col-codes">{ codes.join(', ') }</td>
                  </tr>
                  )
                )}
            </tbody>
          </Table>
  </div>
  )
}

export default BasicTable;