from django.urls import path

from .views import CrawlJobCancelView, CrawlJobCollectionView, CrawlJobDetailView

urlpatterns = [
    path("jobs", CrawlJobCollectionView.as_view(), name="crawler-jobs"),
    path("jobs/<uuid:job_id>", CrawlJobDetailView.as_view(), name="crawler-job"),
    path(
        "jobs/<uuid:job_id>/cancel",
        CrawlJobCancelView.as_view(),
        name="crawler-job-cancel",
    ),
]
