from django.urls import path

from .views import (
    CrawlJobCancelView,
    CrawlJobCollectionView,
    CrawlJobDetailView,
    CrawlJobResultsView,
)

urlpatterns = [
    path("jobs", CrawlJobCollectionView.as_view(), name="crawler-jobs"),
    path("jobs/<uuid:job_id>", CrawlJobDetailView.as_view(), name="crawler-job"),
    path(
        "jobs/<uuid:job_id>/results",
        CrawlJobResultsView.as_view(),
        name="crawler-job-results",
    ),
    path(
        "jobs/<uuid:job_id>/cancel",
        CrawlJobCancelView.as_view(),
        name="crawler-job-cancel",
    ),
]
